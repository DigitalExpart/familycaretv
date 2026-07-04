import { PrismaClient } from '@prisma/client';
import { fromZonedTime } from 'date-fns-tz';
import { addDays } from 'date-fns';

const prisma = new PrismaClient();

async function backfill() {
  console.log('Starting Backfill...');

  // 1. Clear existing pending reminders to make this idempotent
  console.log('Clearing pending reminders...');
  await prisma.reminder.deleteMany({ where: { status: 'PENDING' } });
  
  const nowUtc = new Date();

  // Helper to parse time string
  const parseTimeStr = (timeStr: string) => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return { hours: 0, minutes: 0 };
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3]?.toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return { hours, minutes };
  };

  const getDayName = (date: Date) => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[date.getDay()];
  };

  const formatDateString = (date: Date) => {
      return date.toISOString().split('T')[0];
  };

  // Helper to generate 14-day recurring reminders
  const generateRecurring = async (
    userId: string, type: string, title: string, message: string, 
    sourceType: string, sourceId: string, daysOfWeek: string[], timesOfDay: string[], 
    timezone: string
  ) => {
    const reminders: any[] = [];
    for (let i = 0; i < 14; i++) {
      const targetDate = addDays(nowUtc, i);
      const dayName = getDayName(targetDate);
      const isRightDay = daysOfWeek.some(d => 
        d.toLowerCase() === dayName.toLowerCase() || 
        d.toLowerCase() === 'everyday' || 
        d.toLowerCase() === 'daily'
      );

      if (!isRightDay) continue;

      for (const timeStr of timesOfDay) {
        const { hours, minutes } = parseTimeStr(timeStr);
        const dateString = formatDateString(targetDate);
        const localTimeString = `${dateString} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
        
        const scheduledAt = fromZonedTime(localTimeString, timezone);

        if (scheduledAt > nowUtc) {
          reminders.push({
            userId, type, title, message, scheduledAt, sourceType, sourceId, status: 'PENDING'
          });
        }
      }
    }
    if (reminders.length > 0) {
      await prisma.reminder.createMany({ data: reminders });
    }
  };

  // --- Process Users for Timezones ---
  const users = await prisma.user.findMany({ select: { id: true, timezone: true } });
  const userTimezones = new Map<string, string>();
  users.forEach(u => userTimezones.set(u.id, u.timezone || 'UTC'));

  // --- 1. Medications ---
  console.log('Processing Medications...');
  const medications = await prisma.medication.findMany({ include: { patient: true } });
  for (const med of medications) {
     const tz = userTimezones.get(med.patient.userId) || 'UTC';
     if (med.daysOfWeek && med.timesOfDay && (!med.expiresAt || med.expiresAt > nowUtc)) {
        await generateRecurring(
          med.patient.userId, 'MEDICATION', `Medication: ${med.name}`, `Time to take ${med.name}`,
          'MEDICATION', med.id, med.daysOfWeek, med.timesOfDay, tz
        );
     }
  }

  // --- 2. Tasks ---
  console.log('Processing Tasks...');
  const tasks = await prisma.task.findMany();
  for (const task of tasks) {
      const tz = userTimezones.get(task.userId) || 'UTC';
      if (task.time) {
          if (task.isDaily || (task.daysOfWeek && task.daysOfWeek.length > 0)) {
              await generateRecurring(
                  task.userId, 'TASK', `Task: ${task.title}`, `Reminder: ${task.title}`,
                  'TASK', task.id, task.isDaily ? ['Everyday'] : task.daysOfWeek, [task.time], tz
              );
          } else if (task.date && task.date >= new Date(nowUtc.getFullYear(), nowUtc.getMonth(), nowUtc.getDate())) {
             const { hours, minutes } = parseTimeStr(task.time);
             const dateString = formatDateString(task.date);
             const localTimeString = `${dateString} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
             const scheduledAt = fromZonedTime(localTimeString, tz);
             if (scheduledAt > nowUtc) {
                 await prisma.reminder.create({ data: {
                    userId: task.userId, type: 'TASK', title: `Task: ${task.title}`, message: `Reminder: ${task.title}`,
                    scheduledAt, sourceType: 'TASK', sourceId: task.id, status: 'PENDING'
                 }});
             }
          }
      }
  }

  // --- 3. Child Tasks ---
  console.log('Processing Child Tasks...');
  const childTasks = await prisma.childTask.findMany({ include: { child: true } });
  for (const task of childTasks) {
      const userId = task.child.userId;
      const tz = userTimezones.get(userId) || 'UTC';
      if (task.time) {
          if (task.isDaily || (task.daysOfWeek && task.daysOfWeek.length > 0)) {
              await generateRecurring(
                  userId, 'KIDS_TASK', `Kid's Task: ${task.title}`, `It is time for ${task.child.name} to do: ${task.title}`,
                  'KIDS_TASK', task.id, task.isDaily ? ['Everyday'] : task.daysOfWeek, [task.time], tz
              );
          } else if (task.date && task.date >= new Date(nowUtc.getFullYear(), nowUtc.getMonth(), nowUtc.getDate())) {
             const { hours, minutes } = parseTimeStr(task.time);
             const dateString = formatDateString(task.date);
             const localTimeString = `${dateString} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
             const scheduledAt = fromZonedTime(localTimeString, tz);
             if (scheduledAt > nowUtc) {
                 await prisma.reminder.create({ data: {
                    userId: userId, type: 'KIDS_TASK', title: `Kid's Task: ${task.title}`, message: `${task.child.name} needs to: ${task.title}`,
                    scheduledAt, sourceType: 'KIDS_TASK', sourceId: task.id, status: 'PENDING'
                 }});
             }
          }
      }
  }

  // --- 4. Pet Medications ---
  console.log('Processing Pet Medications...');
  const petMeds = await prisma.petMedication.findMany({ include: { pet: true } });
  for (const med of petMeds) {
      const userId = med.pet.userId;
      const tz = userTimezones.get(userId) || 'UTC';
      if (med.time) {
          await generateRecurring(
              userId, 'PET_MEDICATION', `Pet Medication: ${med.name}`, `Time to give ${med.pet.name} their medication: ${med.name}`,
              'PET_MEDICATION', med.id, ['Everyday'], [med.time], tz
          );
      }
  }

  // --- 5. Events & Appointments ---
  console.log('Processing Events & Appointments...');
  const events = await prisma.event.findMany({ include: { patient: true } });
  for (const event of events) {
      const userId = event.patient.userId;
      if (event.startDateTime > nowUtc) {
         await prisma.reminder.create({ data: {
             userId, type: event.type === 'APPOINTMENT' ? 'APPOINTMENT_REMINDER' : 'EVENT',
             title: `${event.type === 'APPOINTMENT' ? 'Appointment' : 'Event'}: ${event.title}`, message: `${event.patient.fullName} has ${event.title}`,
             scheduledAt: event.startDateTime, sourceType: 'EVENT', sourceId: event.id, status: 'PENDING'
         }});
      }
  }

  // --- 6. Child Events ---
  console.log('Processing Child Events...');
  const childEvents = await prisma.childCalendarEvent.findMany({ include: { child: true } });
  for (const event of childEvents) {
      const userId = event.child.userId;
      if (event.date > nowUtc) {
         await prisma.reminder.create({ data: {
             userId, type: 'EVENT', title: `Kid's Event: ${event.title}`, message: `${event.child.name} has an event: ${event.title}`,
             scheduledAt: event.date, sourceType: 'KIDS_EVENT', sourceId: event.id, status: 'PENDING'
         }});
      }
  }

  // --- 7. Pet Vaccinations ---
  console.log('Processing Pet Vaccinations...');
  const petVax = await prisma.petVaccination.findMany({ include: { pet: true } });
  for (const vax of petVax) {
      const userId = vax.pet.userId;
      if (vax.nextDue && vax.nextDue > nowUtc) {
         await prisma.reminder.create({ data: {
             userId, type: 'PET_VACCINATION', title: `Pet Vaccination: ${vax.vaccineName}`, message: `${vax.pet.name} is due for ${vax.vaccineName}`,
             scheduledAt: vax.nextDue, sourceType: 'PET_VACCINATION', sourceId: vax.id, status: 'PENDING'
         }});
      }
  }

  console.log('Backfill complete!');
}

backfill()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
