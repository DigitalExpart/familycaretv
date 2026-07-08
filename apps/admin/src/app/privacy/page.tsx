export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: July 8, 2026</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Medical Disclaimer</h2>
          <p className="mb-4"><strong>IMPORTANT: NOT MEDICAL ADVICE</strong></p>
          <p className="text-gray-700 leading-relaxed">
            FamilyCare TV is designed to assist users in managing their personal health, medication schedules, and daily tasks. The Application is NOT a medical device. The information, services, and AI interactions provided are for informational purposes only and do NOT constitute medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. AI Disclaimer</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            FamilyCare TV utilizes Artificial Intelligence (AI) to assist with scheduling, task management, and answering general queries.
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>The AI is programmed to be helpful but may occasionally generate incorrect, incomplete, or inappropriate responses.</li>
            <li>The AI must <strong>never</strong> be used in emergency situations or to make critical medical decisions.</li>
            <li>By using the AI assistant, you acknowledge that its outputs are generated automatically and are not reviewed by medical professionals.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Data We Collect</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><strong>Personal Information:</strong> Name, email address, and profile details provided during registration.</li>
            <li><strong>Health Information:</strong> Medication schedules, appointment dates, and caregiver notes entered manually by the user.</li>
            <li><strong>Device Information:</strong> Push notification tokens (Expo Push Tokens) to deliver reminders.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. How We Use Your Data</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>To provide the core functionality of FamilyCare TV (reminders, syncing with Roku, caregiver sharing).</li>
            <li>To send transactional push notifications regarding your health schedule.</li>
            <li>We <strong>do not</strong> sell your personal or health data to third-party marketers.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Data Collection Summary & Security</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><strong>Encrypted in Transit:</strong> Yes (HTTPS/WSS)</li>
            <li><strong>Shared with 3rd Parties:</strong> Only strictly necessary infrastructure providers (e.g., Stripe for payments, OpenAI for processing AI queries). No data is shared for advertising.</li>
            <li><strong>Data Deletion Mechanism:</strong> Users have the right to request the complete deletion of their account and all associated data at any time through the app settings or by contacting our support team.</li>
          </ul>
        </section>

      </div>
    </div>
  );
}
