import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CalendarAggregatorService {
  constructor(private prisma: PrismaService) {}

  async getCalendarEvents(userId: string, startDate?: Date, endDate?: Date) {
    const start = startDate ? new Date(startDate) : new Date();
    start.setUTCHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    end.setUTCHours(23, 59, 59, 999);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Helper to parse time strings like "08:30 AM", "14:00", "Morning", "Night"
    const parseTime = (timeStr?: string | null, defaultHour = 9, defaultMin = 0) => {
      let hours = defaultHour;
      let minutes = defaultMin;
      if (timeStr) {
        const lower = timeStr.toLowerCase().trim();
        if (lower.includes('morning')) {
          hours = 8;
          minutes = 0;
        } else if (lower.includes('noon') || lower.includes('lunch')) {
          hours = 12;
          minutes = 0;
        } else if (lower.includes('afternoon') || lower.includes('daytime')) {
          hours = 13;
          minutes = 0;
        } else if (lower.includes('evening') || lower.includes('dinner')) {
          hours = 18;
          minutes = 0;
        } else if (lower.includes('night') || lower.includes('bedtime')) {
          hours = 21;
          minutes = 0;
        } else {
          const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
          if (match) {
            hours = parseInt(match[1], 10);
            minutes = parseInt(match[2], 10);
            const ampm = match[3]?.toUpperCase();
            if (ampm === 'PM' && hours < 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;
          }
        }
      }
      return { hours, minutes };
    };

    // 1. Fetch Patients with their Events and Medications
    const patients = await this.prisma.patient.findMany({
      where: { userId },
      include: {
        medications: true,
        events: {
          where: {
            startDateTime: { gte: start, lte: end }
          }
        }
      }
    });

    const patientEvents: any[] = [];
    const patientMedicationItems: any[] = [];

    for (const patient of patients) {
      // 1a. Patient Events (Appointments, general calendar events)
      for (const e of patient.events) {
        patientEvents.push({
          id: e.id,
          type: e.type || 'APPOINTMENT', // APPOINTMENT, MEDICATION, TASK
          title: `${e.title}${patient.fullName ? ` - ${patient.fullName}` : ''}`,
          startDateTime: e.startDateTime.toISOString(),
          sourceId: e.id,
          status: e.status || 'ACTIVE',
          category: e.type || 'APPOINTMENT',
        });
      }

      // 1b. Patient Medications (Project onto calendar days)
      for (const med of patient.medications) {
        const cursor = new Date(start);
        const days = med.daysOfWeek || [];
        const times = med.timesOfDay && med.timesOfDay.length > 0 ? med.timesOfDay : ['09:00 AM'];

        while (cursor <= end) {
          if (med.expiresAt && cursor > new Date(med.expiresAt)) {
            cursor.setUTCDate(cursor.getUTCDate() + 1);
            continue;
          }

          const dayName = dayNames[cursor.getUTCDay()];
          const isMatch = days.length === 0 || days.some(d =>
            d.toLowerCase() === dayName.toLowerCase() ||
            d.toLowerCase() === 'everyday' ||
            d.toLowerCase() === 'daily'
          );

          if (isMatch) {
            const dateStr = cursor.toISOString().slice(0, 10);
            times.forEach((timeStr, tIdx) => {
              const { hours, minutes } = parseTime(timeStr, 9 + tIdx * 4, 0);
              const itemDate = new Date(cursor);
              itemDate.setUTCHours(hours, minutes, 0, 0);

              const dosageText = med.dosage ? ` (${med.dosage})` : '';
              patientMedicationItems.push({
                id: `med-${med.id}-${dateStr}-${tIdx}`,
                type: 'MEDICATION',
                title: `${med.name}${dosageText} - ${patient.fullName}`,
                startDateTime: itemDate.toISOString(),
                sourceId: med.id,
                status: 'ACTIVE',
                category: 'MEDICATION',
              });
            });
          }
          cursor.setUTCDate(cursor.getUTCDate() + 1);
        }
      }
    }

    // 2. Fetch specific Reminders (excluding EVENT reminders to avoid duplicates)
    const reminders = await this.prisma.reminder.findMany({
      where: {
        userId,
        scheduledAt: { gte: start, lte: end },
        sourceType: { not: 'EVENT' }
      }
    });

    const reminderItems = reminders.map(r => ({
      id: r.id,
      type: r.type || 'TASK',
      title: r.title,
      startDateTime: r.scheduledAt.toISOString(),
      sourceId: r.sourceId,
      status: r.status || 'PENDING',
      category: r.type || 'REMINDER',
    }));

    // 3. Fetch Daily Tasks for this user
    const tasks = await this.prisma.task.findMany({
      where: { userId }
    });

    const existingTaskSlots = new Set<string>();
    for (const r of reminders) {
      if (r.sourceType === 'TASK' && r.sourceId) {
        const dStr = r.scheduledAt.toISOString().slice(0, 10);
        existingTaskSlots.add(`${r.sourceId}_${dStr}`);
      }
    }

    const projectedTaskItems: any[] = [];
    for (const task of tasks) {
      const { hours, minutes } = parseTime(task.time, 9, 0);

      if (task.isDaily || (task.daysOfWeek && task.daysOfWeek.length > 0)) {
        const cursor = new Date(start);
        while (cursor <= end) {
          const dayName = dayNames[cursor.getUTCDay()];
          const isMatch = task.isDaily || task.daysOfWeek.some(d =>
            d.toLowerCase() === dayName.toLowerCase() ||
            d.toLowerCase() === 'everyday' ||
            d.toLowerCase() === 'daily'
          );

          if (isMatch) {
            const dateStr = cursor.toISOString().slice(0, 10);
            const slotKey = `${task.id}_${dateStr}`;
            if (!existingTaskSlots.has(slotKey)) {
              existingTaskSlots.add(slotKey);
              const itemDate = new Date(cursor);
              itemDate.setUTCHours(hours, minutes, 0, 0);
              projectedTaskItems.push({
                id: `${task.id}-${dateStr}`,
                type: 'TASK',
                title: task.title,
                startDateTime: itemDate.toISOString(),
                sourceId: task.id,
                status: task.completed ? 'COMPLETED' : 'ACTIVE',
                category: task.category || 'TASK',
              });
            }
          }
          cursor.setUTCDate(cursor.getUTCDate() + 1);
        }
      } else if (task.date) {
        const taskDate = new Date(task.date);
        if (taskDate >= start && taskDate <= end) {
          const dateStr = taskDate.toISOString().slice(0, 10);
          const slotKey = `${task.id}_${dateStr}`;
          if (!existingTaskSlots.has(slotKey)) {
            existingTaskSlots.add(slotKey);
            taskDate.setUTCHours(hours, minutes, 0, 0);
            projectedTaskItems.push({
              id: task.id,
              type: 'TASK',
              title: task.title,
              startDateTime: taskDate.toISOString(),
              sourceId: task.id,
              status: task.completed ? 'COMPLETED' : 'ACTIVE',
              category: task.category || 'TASK',
            });
          }
        }
      }
    }

    // 4. Fetch Kids Profiles (Chores, Tasks & Events)
    const kids = await this.prisma.childProfile.findMany({
      where: { userId },
      include: {
        tasks: true,
        events: true,
      }
    });

    const kidsItems: any[] = [];
    for (const child of kids) {
      // 4a. Child Tasks / Chores
      for (const cTask of child.tasks) {
        const { hours, minutes } = parseTime(cTask.time, 10, 0);

        if (cTask.isDaily || (cTask.daysOfWeek && cTask.daysOfWeek.length > 0)) {
          const cursor = new Date(start);
          while (cursor <= end) {
            const dayName = dayNames[cursor.getUTCDay()];
            const isMatch = cTask.isDaily || cTask.daysOfWeek.some(d =>
              d.toLowerCase() === dayName.toLowerCase() ||
              d.toLowerCase() === 'everyday' ||
              d.toLowerCase() === 'daily'
            );

            if (isMatch) {
              const dateStr = cursor.toISOString().slice(0, 10);
              const itemDate = new Date(cursor);
              itemDate.setUTCHours(hours, minutes, 0, 0);
              kidsItems.push({
                id: `kid-task-${cTask.id}-${dateStr}`,
                type: 'KIDS_TASK',
                title: `${cTask.title} - ${child.name}`,
                startDateTime: itemDate.toISOString(),
                sourceId: cTask.id,
                status: cTask.completed ? 'COMPLETED' : 'ACTIVE',
                category: 'KIDS_TASK',
              });
            }
            cursor.setUTCDate(cursor.getUTCDate() + 1);
          }
        } else if (cTask.date) {
          const tDate = new Date(cTask.date);
          if (tDate >= start && tDate <= end) {
            tDate.setUTCHours(hours, minutes, 0, 0);
            kidsItems.push({
              id: `kid-task-${cTask.id}`,
              type: 'KIDS_TASK',
              title: `${cTask.title} - ${child.name}`,
              startDateTime: tDate.toISOString(),
              sourceId: cTask.id,
              status: cTask.completed ? 'COMPLETED' : 'ACTIVE',
              category: 'KIDS_TASK',
            });
          }
        }
      }

      // 4b. Child Calendar Events
      for (const cEvt of child.events) {
        const eDate = new Date(cEvt.date);
        if (eDate >= start && eDate <= end) {
          kidsItems.push({
            id: `kid-evt-${cEvt.id}`,
            type: 'EVENT',
            title: `${cEvt.title} - ${child.name}`,
            startDateTime: eDate.toISOString(),
            sourceId: cEvt.id,
            status: 'ACTIVE',
            category: 'KIDS_EVENT',
          });
        }
      }
    }

    // 5. Fetch Pets (Vaccinations/Appointments, Medications, and Care Tasks)
    const pets = await this.prisma.pet.findMany({
      where: { userId },
      include: {
        vaccinations: true,
        medications: true,
        tasks: true,
      }
    });

    const petItems: any[] = [];
    for (const pet of pets) {
      // 5a. Pet Vaccinations / Appointments (nextDue)
      for (const vax of pet.vaccinations) {
        if (vax.nextDue) {
          const vDate = new Date(vax.nextDue);
          if (vDate >= start && vDate <= end) {
            petItems.push({
              id: `pet-vax-${vax.id}`,
              type: 'PET_VACCINATION',
              title: `${vax.vaccineName} Due - ${pet.name}`,
              startDateTime: vDate.toISOString(),
              sourceId: vax.id,
              status: 'ACTIVE',
              category: 'PET_VACCINATION',
            });
          }
        }
      }

      // 5b. Pet Medications
      for (const pMed of pet.medications) {
        const { hours, minutes } = parseTime(pMed.time, 9, 0);
        const cursor = new Date(start);
        while (cursor <= end) {
          const dayName = dayNames[cursor.getUTCDay()];
          const isMatch = pMed.isDaily || (pMed.daysOfWeek && pMed.daysOfWeek.some(d =>
            d.toLowerCase() === dayName.toLowerCase() ||
            d.toLowerCase() === 'everyday' ||
            d.toLowerCase() === 'daily'
          ));

          if (isMatch) {
            const dateStr = cursor.toISOString().slice(0, 10);
            const itemDate = new Date(cursor);
            itemDate.setUTCHours(hours, minutes, 0, 0);
            const dosageText = pMed.dosage ? ` (${pMed.dosage})` : '';
            petItems.push({
              id: `pet-med-${pMed.id}-${dateStr}`,
              type: 'PET_MEDICATION',
              title: `${pMed.name}${dosageText} - ${pet.name}`,
              startDateTime: itemDate.toISOString(),
              sourceId: pMed.id,
              status: 'ACTIVE',
              category: 'PET_MEDICATION',
            });
          }
          cursor.setUTCDate(cursor.getUTCDate() + 1);
        }
      }

      // 5c. Pet Tasks / Care
      for (const pTask of pet.tasks) {
        const { hours, minutes } = parseTime(pTask.time, 8, 30);
        if (pTask.isDaily || (pTask.daysOfWeek && pTask.daysOfWeek.length > 0)) {
          const cursor = new Date(start);
          while (cursor <= end) {
            const dayName = dayNames[cursor.getUTCDay()];
            const isMatch = pTask.isDaily || pTask.daysOfWeek.some(d =>
              d.toLowerCase() === dayName.toLowerCase() ||
              d.toLowerCase() === 'everyday' ||
              d.toLowerCase() === 'daily'
            );

            if (isMatch) {
              const dateStr = cursor.toISOString().slice(0, 10);
              const itemDate = new Date(cursor);
              itemDate.setUTCHours(hours, minutes, 0, 0);
              petItems.push({
                id: `pet-task-${pTask.id}-${dateStr}`,
                type: 'TASK',
                title: `${pTask.title} - ${pet.name}`,
                startDateTime: itemDate.toISOString(),
                sourceId: pTask.id,
                status: pTask.completed ? 'COMPLETED' : 'ACTIVE',
                category: 'PET_TASK',
              });
            }
            cursor.setUTCDate(cursor.getUTCDate() + 1);
          }
        } else if (pTask.date) {
          const pDate = new Date(pTask.date);
          if (pDate >= start && pDate <= end) {
            pDate.setUTCHours(hours, minutes, 0, 0);
            petItems.push({
              id: `pet-task-${pTask.id}`,
              type: 'TASK',
              title: `${pTask.title} - ${pet.name}`,
              startDateTime: pDate.toISOString(),
              sourceId: pTask.id,
              status: pTask.completed ? 'COMPLETED' : 'ACTIVE',
              category: 'PET_TASK',
            });
          }
        }
      }
    }

    // Combine all sources
    const calendarItems = [
      ...patientEvents,
      ...patientMedicationItems,
      ...reminderItems,
      ...projectedTaskItems,
      ...kidsItems,
      ...petItems,
    ];

    // Sort chronologically by startDateTime
    calendarItems.sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());

    return calendarItems;
  }
}
