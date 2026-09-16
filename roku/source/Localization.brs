' ============================================================
' Localization.brs — FamilyCare TV language helper
' Usage: GetStr("key")  →  returns localized string
' Language is persisted in Registry under "app_language" (EN | ES)
' ============================================================

function ReadLanguagePref() as String
    reg = GetRegistry()
    if reg.Exists("app_language")
        return reg.Read("app_language")
    end if
    return "EN"
end function

function SaveLanguagePref(lang as String)
    reg = GetRegistry()
    reg.Write("app_language", lang)
    reg.Flush()
end function

function GetStr(key as String) as String
    lang = ReadLanguagePref()

    ' ---- English strings ----
    en = {
        ' Sidebar navigation
        "Nav_Home"        : "Home",
        "Nav_Patients"    : "Patients",
        "Nav_Calendar"    : "Calendar",
        "Nav_Medications" : "Medications",
        "Nav_Notes"       : "Notes",
        "Nav_Music"       : "Music",
        "Nav_Kids"        : "Kids",
        "Nav_Pets"        : "Pets",
        "Nav_Settings"    : "Settings",

        ' Quick action descriptions
        "QA_Patients_Desc"    : "View & manage",
        "QA_Calendar_Desc"    : "Events & appointments",
        "QA_Medications_Desc" : "Reminders & dosages",
        "QA_Music_Desc"       : "Relaxing playlists",
        "QA_Kids_Desc"        : "Coloring & activities",
        "QA_Pets_Desc"        : "Pet care tracker",
        "QA_Notes_Desc"       : "Personal notes",
        "QA_Settings_Desc"    : "App preferences",

        ' Home screen labels
        "Home_WelcomeHome"    : "Welcome Home",
        "Home_WelcomeUser"    : "Welcome, ",
        "Home_Subtitle"       : "Here is your family's daily wellness summary",
        "Home_Loading"        : "Loading your FamilyCare data...",
        "Home_NoSchedule"     : "All clear — no items scheduled for today",
        "Home_ErrorFetch"     : "Unable to refresh FamilyCare data. Press * to retry.",
        "Home_AccountConn"    : "Account Connected",
        "Home_VerseSection"   : "VERSE OF THE DAY",
        "Home_BookSection"    : "FEATURED BOOK",
        "Home_ActionsSection" : "QUICK ACTIONS",
        "Home_LoadingDash"    : "Loading your dashboard...",

        ' Home Stat badges
        "Stats_Patients"      : "PATIENTS",
        "Stats_Appointments"  : "APPOINTMENTS",
        "Stats_Medications"   : "MEDICATIONS",
        "Stats_Notes"         : "NOTES",

        ' Featured Book
        "Featured_Book_Btn"   : "Featured Book",

        ' Patient Detail
        "patient_detail_title"   : "Patient Detail",
        "dob_prefix"             : "DOB",
        "doctors_prefix"         : "Doctors",
        "medications_prefix"     : "Medications",
        "notes_prefix"           : "Notes",
        "medical_notes_section"  : "Medical Notes & Care Instructions",
        "no_medical_notes"       : "No medical notes recorded for this patient.",
        "edit_patient_btn"       : "✎ Edit Patient",
        "delete_patient_btn"     : "🗑 Delete",
        "confirm_delete_title"   : "Delete Patient",
        "confirm_delete_msg"     : "Are you sure you want to delete this patient record? This action cannot be undone.",
        "confirm_delete_yes"     : "Yes, Delete",
        "cancel"                 : "Cancel",
        "not_specified"          : "Not specified",

        ' Patients Directory
        "patients_directory_title" : "Patients Directory",
        "add_patient_btn"          : "✚ Add Patient",
        "no_patients_found"        : "No Patients Found",
        "no_patients_desc"         : "There are currently no patient profiles registered in your account.",
        "add_patient_hint"         : "Click the [+ Add Patient] button above to create a new profile.",
        "patients_footer"          : "Back Return  |  OK View/Edit Patient  |  ▲ Up to Add Patient Button",

        ' Patient Form
        "add_new_patient_title"    : "Add New Patient",
        "edit_patient_title"       : "Edit Patient",
        "patient_form_sub"         : "Enter patient information below using the TV remote keyboard.",
        "save_patient_btn"         : "Save Patient",
        "name_label"               : "Full Name *",
        "dob_label"                : "Date of Birth (YYYY-MM-DD)",
        "gender_label"             : "Gender",
        "notes_label"              : "Medical Notes / Care Instructions",

        ' Calendar
        "calendar_title"           : "Family Calendar",
        "prev_month_btn"           : "◄ Prev",
        "next_month_btn"           : "Next ►",
        "add_event_btn"            : "✚ Add Event",
        "todays_schedule_title"    : "Today's Schedule",
        "no_events_day"            : "No events scheduled for this day.",
        "calendar_footer"          : "◄/► Select Day  |  ▲/▼ Navigate Calendar  |  OK View Day's Schedule",

        ' Event Form
        "add_event_title"          : "Add Calendar Event",
        "edit_event_title"         : "Edit Event",
        "event_form_sub"           : "Schedule appointments, reminders, and care events.",
        "event_title_label"        : "Event Title *",
        "event_date_label"         : "Date & Time (YYYY-MM-DD HH:MM) *",
        "event_type_label"         : "Event Type (APPOINTMENT, MEDICATION, TASK)",
        "event_desc_label"         : "Description / Location",
        "save_event_btn"           : "Save Event",

        ' Medications
        "medications_title"        : "Medications",
        "add_med_btn"              : "✚ Add Medication",
        "no_meds_found"            : "No Medications Found",
        "no_meds_desc"             : "No medications currently registered.",
        "med_dosage_prefix"        : "Dosage",
        "med_schedule_prefix"      : "Schedule",
        "medications_footer"       : "Back Return  |  OK View Details  |  ▲ Add Medication",

        ' Medication Form
        "add_med_title"            : "Add Medication",
        "edit_med_title"           : "Edit Medication",
        "med_form_sub"             : "Enter medication details using the remote control.",
        "med_name_label"           : "Medication Name *",
        "med_dosage_label"         : "Dosage",
        "med_frequency_label"      : "Frequency / Schedule",
        "med_purpose_label"        : "Purpose / Reason",
        "save_med_btn"             : "Save Medication",

        ' Notes
        "notes_title"              : "Care Notes",
        "add_note_btn"             : "✚ Add Note",
        "no_notes_found"           : "No Notes Recorded",
        "notes_footer"             : "Back Return  |  OK View/Edit Note  |  ▲ Add Note",

        ' Note Form
        "add_note_title"           : "Add Personal Note",
        "edit_note_title"          : "Edit Care Note",
        "note_form_sub"            : "Create personal care notes, doctor instructions, and reminders.",
        "note_title_label"         : "Note Title *",
        "note_category_label"      : "Category (MEDICAL, GENERAL, TASK)",
        "note_content_label"       : "Note Content / Details *",
        "save_note_btn"            : "Save Note",

        ' Music
        "music_title"              : "Wellness & Relaxation Music",
        "music_subtitle"           : "Calming tracks curated for wellness and mindfulness",
        "now_playing"              : "Now Playing",
        "play_pause"               : "Play / Pause",
        "music_footer"             : "Back Return to Dashboard  |  OK Play Selected Track  |  ◄ Left / ► Right Audio Controls",
        "music_select_track"       : "Select Playlist Track",
        "music_hint"               : "Press OK to Play / Pause active track",
        "music_empty"              : "No music tracks available in your library.",
        "music_play"               : "Play",
        "music_pause"              : "Pause",

        ' Kids
        "kids_title"               : "Kids Activities & Coloring Gallery",
        "kids_subtitle"            : "Fun, engaging activities and daily chore tracking",
        "kids_coloring"            : "Coloring & Drawing",
        "kids_chores"              : "Chores & Tasks",
        "kids_footer"              : "Back Return to Dashboard  |  OK View Activity Card",
        "scan_to_print"            : "Scan to Print",
        "close_preview_hint"       : "Press BACK or OK to close preview",
        "drawing_title"            : "Drawing of the Day & Activity Gallery",
        "drawing_scan_buy"         : "Scan to Buy Book",
        "drawing_thought_title"    : "Thought of the Day",
        "drawing_footer"           : "Back Return to Dashboard  |  Scan QR code with smartphone to order custom coloring books",

        ' Pets
        "pets_title"               : "Pet Care & Health",
        "add_pet_btn"              : "✚ Add Pet",
        "no_pets_found"            : "No Pet Profiles Found",
        "pets_empty_desc"          : "Keep track of pet feeding schedules, vet contacts, and care instructions.",
        "pets_empty_hint"          : "Click [+ Add Pet] above to create your family pet profile.",
        "pets_footer"              : "Back Return  |  OK Edit Pet Profile  |  * Options Delete  |  ▲ Up to Add Button",
        "confirm_delete_pet_title" : "Delete Pet Profile",
        "confirm_delete_pet_msg"   : "Are you sure you want to delete this pet profile?",

        ' Pet Form
        "add_pet_title"            : "Add Pet Profile",
        "edit_pet_title"           : "Edit Pet Profile",
        "pet_form_sub"             : "Enter pet details and care instructions.",
        "pet_name_label"           : "Pet Name *",
        "pet_species_label"        : "Species *",
        "pet_breed_label"          : "Breed / Color",
        "pet_notes_label"          : "Care Notes & Vet Info",
        "save_pet_btn"             : "Save Pet",

        ' Books
        "books_title"              : "Wellness & Senior Living Library",
        "books_subtitle"           : "Curated reading for healthy, active living",
        "book_of_the_day"          : "Book of the Day",
        "scan_to_view"             : "Scan to View",
        "books_recently_added"     : "Recently Added",
        "books_browse_all"         : "Browse All Books",
        "read_book_btn"            : "Read Book",
        "books_footer"             : "▲/▼ Select Book  |  OK Read Details  |  Back Return",

        ' Bible Verse
        "verse_screen_title"       : "Verse of the Day",
        "verse_screen_subtitle"    : "Daily inspiration & spiritual wellness",
        "verse_daily_reflection"   : "Daily Scripture & Reflection",
        "verse_thought_today"      : "Thought for Today",
        "verse_footer"             : "Back Return to Dashboard  |  OK Toggle English / Spanish Language",

        ' Device Link
        "devicelink_title"         : "Link Your Roku TV",
        "devicelink_code_label"    : "Your Activation Code:",
        "devicelink_instruction"   : "To link this TV to your FamilyCare account, enter the code below:",
        "devicelink_step1"         : "Step 1: Open FamilyCare Mobile or Web App",
        "devicelink_step2"         : "Step 2: Go to Profile → Connect Roku TV",
        "devicelink_step3"         : "Step 3: Enter the code shown above",
        "devicelink_waiting"       : "Waiting for device activation...",
        "devicelink_instructions"  : "Visit the FamilyCare website or mobile app to enter this code.",
        "devicelink_checking"      : "Checking link status...",

        ' Common Dialogs & Errors
        "retry"                    : "Retry",
        "save"                     : "Save",
        "close"                    : "Close",
        "loading"                  : "Loading...",
        "error_loading"            : "An error occurred while loading data.",

        ' Screensaver labels
        "SS_TodaySchedule"  : "TODAY'S SCHEDULE",
        "SS_VerseOfDay"     : "VERSE OF THE DAY",
        "SS_FeaturedBook"   : "FEATURED BOOK",
        "SS_NoSchedule"     : "No items scheduled today. Enjoy your day!",
        "SS_AllClear"       : "All clear today",

        ' Settings
        "Settings_LangEN"            : "Current Language: English (EN) • Press OK to switch to Spanish",
        "Settings_LangES"            : "Current Language: Español (ES) • Press OK to switch to English",
        "Settings_Title"             : "App Settings & Device Pairing",
        "Settings_DeviceTitle"       : "Device Pairing & Account Status",
        "Settings_ScreensaverTitle"  : "Screensaver & Display Settings",
        "Settings_ScreensaverDesc"   : "Displays Drawing of the Day & Scripture when TV is idle.",
        "Settings_UnlinkTitle"       : "Unlink Device / Logout",
        "Settings_UnlinkDesc"        : "Disconnect this Roku TV from your FamilyCare account and clear stored authentication.",
        "Settings_Footer"            : "Back Return to Dashboard  |  OK Select Setting Option",
        "Settings_UnlinkDialogTitle" : "Unlink Device",
        "Settings_UnlinkDialogMsg"   : "Are you sure you want to unlink this Roku TV? You will need a new 6-digit pairing code from the FamilyCare mobile/web app to re-pair.",
        "Settings_UnlinkYes"         : "Yes, Unlink"
    }

    ' ---- Spanish strings ----
    es = {
        ' Sidebar navigation
        "Nav_Home"        : "Inicio",
        "Nav_Patients"    : "Pacientes",
        "Nav_Calendar"    : "Calendario",
        "Nav_Medications" : "Medicamentos",
        "Nav_Notes"       : "Notas",
        "Nav_Music"       : "Música",
        "Nav_Kids"        : "Niños",
        "Nav_Pets"        : "Mascotas",
        "Nav_Settings"    : "Ajustes",

        ' Quick action descriptions
        "QA_Patients_Desc"    : "Ver y gestionar",
        "QA_Calendar_Desc"    : "Eventos y citas",
        "QA_Medications_Desc" : "Recordatorios y dosis",
        "QA_Music_Desc"       : "Listas de relajación",
        "QA_Kids_Desc"        : "Colorear y actividades",
        "QA_Pets_Desc"        : "Cuidado de mascotas",
        "QA_Notes_Desc"       : "Notas personales",
        "QA_Settings_Desc"    : "Preferencias de la app",

        ' Home screen labels
        "Home_WelcomeHome"    : "Bienvenido",
        "Home_WelcomeUser"    : "Bienvenido, ",
        "Home_Subtitle"       : "Aquí está el resumen de bienestar familiar de hoy",
        "Home_Loading"        : "Cargando su información de FamilyCare...",
        "Home_NoSchedule"     : "Todo libre — no hay eventos programados hoy",
        "Home_ErrorFetch"     : "No se pudo actualizar. Presione * para reintentar.",
        "Home_AccountConn"    : "Cuenta conectada",
        "Home_VerseSection"   : "VERSÍCULO DEL DÍA",
        "Home_BookSection"    : "LIBRO DESTACADO",
        "Home_ActionsSection" : "ACCIONES RÁPIDAS",
        "Home_LoadingDash"    : "Cargando el panel...",

        ' Home Stat badges
        "Stats_Patients"      : "PACIENTES",
        "Stats_Appointments"  : "CITAS",
        "Stats_Medications"   : "MEDICAMENTOS",
        "Stats_Notes"         : "NOTAS",

        ' Featured Book
        "Featured_Book_Btn"   : "Libro destacado",

        ' Patient Detail
        "patient_detail_title"   : "Detalle del paciente",
        "dob_prefix"             : "Fecha de nacimiento",
        "doctors_prefix"         : "Médicos",
        "medications_prefix"     : "Medicamentos",
        "notes_prefix"           : "Notas",
        "medical_notes_section"  : "Notas médicas e instrucciones de cuidado",
        "no_medical_notes"       : "No hay notas médicas registradas para este paciente.",
        "edit_patient_btn"       : "✎ Editar paciente",
        "delete_patient_btn"     : "🗑 Eliminar",
        "confirm_delete_title"   : "Eliminar paciente",
        "confirm_delete_msg"     : "¿Está seguro de que desea eliminar este registro de paciente? Esta acción no se puede deshacer.",
        "confirm_delete_yes"     : "Sí, eliminar",
        "cancel"                 : "Cancelar",
        "not_specified"          : "No especificado",

        ' Patients Directory
        "patients_directory_title" : "Directorio de pacientes",
        "add_patient_btn"          : "✚ Agregar paciente",
        "no_patients_found"        : "No se encontraron pacientes",
        "no_patients_desc"         : "Actualmente no hay perfiles de pacientes registrados en su cuenta.",
        "add_patient_hint"         : "Haga clic en el botón [+ Agregar paciente] para crear un nuevo perfil.",
        "patients_footer"          : "Atrás Volver  |  OK Ver/Editar paciente  |  ▲ Arriba al botón Agregar",

        ' Patient Form
        "add_new_patient_title"    : "Agregar nuevo paciente",
        "edit_patient_title"       : "Editar paciente",
        "patient_form_sub"         : "Ingrese la información del paciente con el control remoto.",
        "save_patient_btn"         : "Guardar paciente",
        "name_label"               : "Nombre completo *",
        "dob_label"                : "Fecha de nacimiento (AAAA-MM-DD)",
        "gender_label"             : "Género",
        "notes_label"              : "Notas médicas / Instrucciones",

        ' Calendar
        "calendar_title"           : "Calendario familiar",
        "prev_month_btn"           : "◄ Ant",
        "next_month_btn"           : "Sig ►",
        "add_event_btn"            : "✚ Agregar evento",
        "todays_schedule_title"    : "Horario de hoy",
        "no_events_day"            : "No hay eventos programados para este día.",
        "calendar_footer"          : "◄/► Seleccionar día  |  ▲/▼ Navegar calendario  |  OK Ver horario del día",

        ' Event Form
        "add_event_title"          : "Agregar evento de calendario",
        "edit_event_title"         : "Editar evento",
        "event_form_sub"           : "Programe citas, recordatorios y eventos de cuidado.",
        "event_title_label"        : "Título del evento *",
        "event_date_label"         : "Fecha y hora (AAAA-MM-DD HH:MM) *",
        "event_type_label"         : "Tipo (CITA, MEDICAMENTO, TAREA)",
        "event_desc_label"         : "Descripción / Ubicación",
        "save_event_btn"           : "Guardar evento",

        ' Medications
        "medications_title"        : "Medicamentos",
        "add_med_btn"              : "✚ Agregar medicamento",
        "no_meds_found"            : "No se encontraron medicamentos",
        "no_meds_desc"             : "No hay medicamentos registrados actualmente.",
        "med_dosage_prefix"        : "Dosis",
        "med_schedule_prefix"      : "Horario",
        "medications_footer"       : "Atrás Volver  |  OK Ver detalles  |  ▲ Agregar medicamento",

        ' Medication Form
        "add_med_title"            : "Agregar medicamento",
        "edit_med_title"           : "Editar medicamento",
        "med_form_sub"             : "Ingrese los detalles del medicamento usando el control remoto.",
        "med_name_label"           : "Nombre del medicamento *",
        "med_dosage_label"         : "Dosis",
        "med_frequency_label"      : "Frecuencia / Horario",
        "med_purpose_label"        : "Propósito / Motivo",
        "save_med_btn"             : "Guardar medicamento",

        ' Notes
        "notes_title"              : "Notas de cuidado",
        "add_note_btn"             : "✚ Agregar nota",
        "no_notes_found"           : "No hay notas registradas",
        "notes_footer"             : "Atrás Volver  |  OK Ver/Editar nota  |  ▲ Agregar nota",

        ' Note Form
        "add_note_title"           : "Agregar nota personal",
        "edit_note_title"          : "Editar nota de cuidado",
        "note_form_sub"            : "Cree notas de cuidado personal, instrucciones del médico y recordatorios.",
        "note_title_label"         : "Título de la nota *",
        "note_category_label"      : "Categoría (MÉDICA, GENERAL, TAREA)",
        "note_content_label"       : "Contenido de la nota / Detalles *",
        "save_note_btn"            : "Guardar nota",

        ' Music
        "music_title"              : "Música de bienestar y relajación",
        "music_subtitle"           : "Pistas relajantes seleccionadas para su bienestar",
        "now_playing"              : "Reproduciendo ahora",
        "play_pause"               : "Reproducir / Pausa",
        "music_footer"             : "Atrás Volver al panel  |  OK Reproducir pista  |  ◄ Izq / ► Der Controles de audio",
        "music_select_track"       : "Seleccionar pista de la lista",
        "music_hint"               : "Presione OK para reproducir / pausar la pista activa",
        "music_empty"              : "No hay pistas de música disponibles en su biblioteca.",
        "music_play"               : "Reproducir",
        "music_pause"              : "Pausa",

        ' Kids
        "kids_title"               : "Actividades para niños y galería de colorear",
        "kids_subtitle"            : "Actividades divertidas y seguimiento de tareas diarias",
        "kids_coloring"            : "Colorear y dibujar",
        "kids_chores"              : "Tareas y quehaceres",
        "kids_footer"              : "Atrás Volver al panel  |  OK Ver tarjeta de actividad",
        "scan_to_print"            : "Escanear para imprimir",
        "close_preview_hint"       : "Presione ATRÁS u OK para cerrar la vista previa",
        "drawing_title"            : "Dibujo del día y galería de actividades",
        "drawing_scan_buy"         : "Escanear para comprar libro",
        "drawing_thought_title"    : "Pensamiento del día",
        "drawing_footer"           : "Atrás Volver al panel  |  Escanee el código QR para pedir libros de colorear",

        ' Pets
        "pets_title"               : "Cuidado y salud de mascotas",
        "add_pet_btn"              : "✚ Agregar mascota",
        "no_pets_found"            : "No se encontraron perfiles de mascotas",
        "pets_empty_desc"          : "Lleve el control de horarios de alimentación, contactos del veterinario e instrucciones de cuidado.",
        "pets_empty_hint"          : "Haga clic en [+ Agregar mascota] para crear el perfil de su mascota.",
        "pets_footer"              : "Atrás Volver  |  OK Editar perfil  |  * Opciones Eliminar  |  ▲ Arriba al botón Agregar",
        "confirm_delete_pet_title" : "Eliminar perfil de mascota",
        "confirm_delete_pet_msg"   : "¿Está seguro de que desea eliminar este perfil de mascota?",

        ' Pet Form
        "add_pet_title"            : "Agregar perfil de mascota",
        "edit_pet_title"           : "Editar perfil de mascota",
        "pet_form_sub"             : "Ingrese los detalles de la mascota e instrucciones de cuidado.",
        "pet_name_label"           : "Nombre de la mascota *",
        "pet_species_label"        : "Especie *",
        "pet_breed_label"          : "Raza / Color",
        "pet_notes_label"          : "Notas de cuidado e info del veterinario",
        "save_pet_btn"             : "Guardar mascota",

        ' Books
        "books_title"              : "Biblioteca de bienestar para adultos mayores",
        "books_subtitle"           : "Lecturas seleccionadas para una vida activa y saludable",
        "book_of_the_day"          : "Libro del día",
        "scan_to_view"             : "Escanear para ver",
        "books_recently_added"     : "Agregados recientemente",
        "books_browse_all"         : "Explorar todos los libros",
        "read_book_btn"            : "Leer libro",
        "books_footer"             : "▲/▼ Seleccionar libro  |  OK Ver detalles  |  Atrás Volver",

        ' Bible Verse
        "verse_screen_title"       : "Versículo del día",
        "verse_screen_subtitle"    : "Inspiración diaria y bienestar espiritual",
        "verse_daily_reflection"   : "Escritura diaria y reflexión",
        "verse_thought_today"      : "Pensamiento del día",
        "verse_footer"             : "Atrás Volver al panel  |  OK Cambiar idioma inglés / español",

        ' Device Link
        "devicelink_title"         : "Vincule su Roku TV",
        "devicelink_code_label"    : "Su código de activación:",
        "devicelink_instruction"   : "Para vincular este televisor a su cuenta de FamilyCare, ingrese el código abajo:",
        "devicelink_step1"         : "Paso 1: Abra la aplicación web o móvil de FamilyCare",
        "devicelink_step2"         : "Paso 2: Vaya a Perfil → Vincular Roku TV",
        "devicelink_step3"         : "Paso 3: Ingrese el código mostrado arriba",
        "devicelink_waiting"       : "Esperando la activación del dispositivo...",
        "devicelink_instructions"  : "Visite el sitio web o la app de FamilyCare para ingresar este código.",
        "devicelink_checking"      : "Comprobando vinculación...",

        ' Common Dialogs & Errors
        "retry"                    : "Reintentar",
        "save"                     : "Guardar",
        "close"                    : "Cerrar",
        "loading"                  : "Cargando...",
        "error_loading"            : "Ocurrió un error al cargar los datos.",

        ' Screensaver labels
        "SS_TodaySchedule"  : "HORARIO DE HOY",
        "SS_VerseOfDay"     : "VERSÍCULO DEL DÍA",
        "SS_FeaturedBook"   : "LIBRO DESTACADO",
        "SS_NoSchedule"     : "No hay eventos hoy. ¡Disfrute su día!",
        "SS_AllClear"       : "Todo libre hoy",

        ' Settings
        "Settings_LangEN"            : "Idioma actual: English (EN) • Presione OK para cambiar a Español",
        "Settings_LangES"            : "Idioma actual: Español (ES) • Presione OK para cambiar a English",
        "Settings_Title"             : "Ajustes de la app y vinculación",
        "Settings_DeviceTitle"       : "Vinculación del dispositivo y estado",
        "Settings_ScreensaverTitle"  : "Ajustes de salvapantallas y pantalla",
        "Settings_ScreensaverDesc"   : "Muestra el dibujo del día y versículos cuando la TV está inactiva.",
        "Settings_UnlinkTitle"       : "Desvincular dispositivo / Cerrar sesión",
        "Settings_UnlinkDesc"        : "Desconectar este Roku TV de su cuenta de FamilyCare y borrar las credenciales guardadas.",
        "Settings_Footer"            : "Atrás Volver al panel  |  OK Seleccionar opción de ajuste",
        "Settings_UnlinkDialogTitle" : "Desvincular dispositivo",
        "Settings_UnlinkDialogMsg"   : "¿Está seguro de que desea desvincular este Roku TV? Necesitará un nuevo código de 6 dígitos para volver a vincular.",
        "Settings_UnlinkYes"         : "Sí, desvincular"
    }

    ' Return ES string if available, fall back to EN, fall back to key
    if lang = "ES"
        if es.DoesExist(key) then return es[key]
    end if
    if en.DoesExist(key) then return en[key]
    return key
end function
