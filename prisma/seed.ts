import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.performance.deleteMany();
  await prisma.district.deleteMany();

  console.log('🗑️ Cleared existing data');

  // Seed districts
  const districts = [
    // Maharashtra
    { districtId: 'pune', name: 'Pune', state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567 },
    { districtId: 'mumbai', name: 'Mumbai', state: 'Maharashtra', latitude: 19.0760, longitude: 72.8777 },
    { districtId: 'nagpur', name: 'Nagpur', state: 'Maharashtra', latitude: 21.1458, longitude: 79.0882 },
    { districtId: 'nashik', name: 'Nashik', state: 'Maharashtra', latitude: 20.0059, longitude: 73.7910 },
    
    // Karnataka
    { districtId: 'bangalore-urban', name: 'Bangalore Urban', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },
    { districtId: 'mysore', name: 'Mysore', state: 'Karnataka', latitude: 12.2958, longitude: 76.6394 },
    { districtId: 'belgaum', name: 'Belgaum', state: 'Karnataka', latitude: 15.8497, longitude: 74.4977 },
    
    // Rajasthan
    { districtId: 'jaipur', name: 'Jaipur', state: 'Rajasthan', latitude: 26.9124, longitude: 75.7873 },
    { districtId: 'udaipur', name: 'Udaipur', state: 'Rajasthan', latitude: 24.5854, longitude: 73.7125 },
    { districtId: 'jodhpur', name: 'Jodhpur', state: 'Rajasthan', latitude: 26.2389, longitude: 73.0243 },
    
    // Uttar Pradesh
    { districtId: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh', latitude: 26.8467, longitude: 80.9462 },
    { districtId: 'varanasi', name: 'Varanasi', state: 'Uttar Pradesh', latitude: 25.3176, longitude: 82.9739 },
    { districtId: 'kanpur', name: 'Kanpur', state: 'Uttar Pradesh', latitude: 26.4499, longitude: 80.3319 },
    
    // Other major districts
    { districtId: 'patna', name: 'Patna', state: 'Bihar', latitude: 25.5941, longitude: 85.1376 },
    { districtId: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat', latitude: 23.0225, longitude: 72.5714 },
    { districtId: 'hyderabad', name: 'Hyderabad', state: 'Telangana', latitude: 17.3850, longitude: 78.4867 },
    { districtId: 'chennai', name: 'Chennai', state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707 },
    { districtId: 'kolkata', name: 'Kolkata', state: 'West Bengal', latitude: 22.5726, longitude: 88.3639 },
    { districtId: 'bhopal', name: 'Bhopal', state: 'Madhya Pradesh', latitude: 23.2599, longitude: 77.4126 },
    { districtId: 'chandigarh', name: 'Chandigarh', state: 'Chandigarh', latitude: 30.7333, longitude: 76.7794 },
  ];

  for (const district of districts) {
    await prisma.district.create({
      data: district,
    });
  }

  console.log(`✅ Seeded ${districts.length} districts`);

  // Seed sample performance data for current year
  const currentYear = new Date().getFullYear();
  const performanceData = [];

  for (const district of districts) {
    for (let month = 1; month <= 12; month++) {
      const totalHouseholds = Math.floor(Math.random() * 50000) + 10000;
      const totalWorkers = Math.floor(totalHouseholds * (Math.random() * 0.8 + 0.2));
      const personDays = Math.floor(totalWorkers * (Math.random() * 15 + 15));
      const womenParticipation = Math.random() * 30 + 40; // 40-70%
      const scstParticipation = Math.random() * 20 + 20; // 20-40%
      const totalFunds = personDays * 250; // Assuming ₹250 per person day
      const fundsUtilized = totalFunds * (Math.random() * 0.2 + 0.8); // 80-100% utilization

      performanceData.push({
        districtId: district.districtId,
        month,
        year: currentYear,
        totalHouseholds,
        totalWorkers,
        personDays,
        womenParticipation: Math.round(womenParticipation * 10) / 10,
        scstParticipation: Math.round(scstParticipation * 10) / 10,
        totalFunds: Math.round(totalFunds),
        fundsUtilized: Math.round(fundsUtilized),
      });
    }
  }

  // Also add data for previous year
  const previousYear = currentYear - 1;
  for (const district of districts) {
    for (let month = 1; month <= 12; month++) {
      const totalHouseholds = Math.floor(Math.random() * 45000) + 8000;
      const totalWorkers = Math.floor(totalHouseholds * (Math.random() * 0.8 + 0.2));
      const personDays = Math.floor(totalWorkers * (Math.random() * 15 + 15));
      const womenParticipation = Math.random() * 30 + 35; // 35-65%
      const scstParticipation = Math.random() * 20 + 18; // 18-38%
      const totalFunds = personDays * 240; // Slightly lower rate for previous year
      const fundsUtilized = totalFunds * (Math.random() * 0.2 + 0.75); // 75-95% utilization

      performanceData.push({
        districtId: district.districtId,
        month,
        year: previousYear,
        totalHouseholds,
        totalWorkers,
        personDays,
        womenParticipation: Math.round(womenParticipation * 10) / 10,
        scstParticipation: Math.round(scstParticipation * 10) / 10,
        totalFunds: Math.round(totalFunds),
        fundsUtilized: Math.round(fundsUtilized),
      });
    }
  }

  // Batch insert performance data
  const batchSize = 100;
  for (let i = 0; i < performanceData.length; i += batchSize) {
    const batch = performanceData.slice(i, i + batchSize);
    await prisma.performance.createMany({
      data: batch,
    });
  }

  console.log(`✅ Seeded ${performanceData.length} performance records`);

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });