import { PrismaClient, ActivityMode } from '@prisma/client';
import { hashPassword } from '../src/shared/utils/hash';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up
  await prisma.userChallenge.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.territory.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // Create demo users
  const password = await hashPassword('password123');

  const users = await Promise.all([
    prisma.user.create({ data: { name: 'General João', nickname: 'general_joao', email: 'joao@racewar.com', passwordHash: password } }),
    prisma.user.create({ data: { name: 'Cyclone Ana', nickname: 'cyclone_ana', email: 'ana@racewar.com', passwordHash: password } }),
    prisma.user.create({ data: { name: 'SkateKing Rafael', nickname: 'skate_rafael', email: 'rafael@racewar.com', passwordHash: password } }),
    prisma.user.create({ data: { name: 'Runner Beatriz', nickname: 'runner_bea', email: 'bea@racewar.com', passwordHash: password } }),
    prisma.user.create({ data: { name: 'Você', nickname: 'general_you', email: 'you@racewar.com', passwordHash: password } }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create activities and territories
  const modeMap: ActivityMode[] = ['RACE', 'BIKE', 'SKATE', 'RACE', 'RACE'];
  const baseLat = -23.555;
  const baseLng = -46.633;

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const mode = modeMap[i];

    for (let j = 0; j < 3; j++) {
      const lat = baseLat + (Math.random() - 0.5) * 0.04;
      const lng = baseLng + (Math.random() - 0.5) * 0.04;
      const size = 0.003 + Math.random() * 0.004;

      const polygon = [
        { latitude: lat, longitude: lng },
        { latitude: lat + size, longitude: lng + size * 0.5 },
        { latitude: lat + size * 0.8, longitude: lng + size * 1.2 },
        { latitude: lat - size * 0.2, longitude: lng + size },
      ];

      const activity = await prisma.activity.create({
        data: {
          userId: user.id,
          mode,
          route: polygon as object[],
          distanceKm: 1.5 + Math.random() * 4,
          durationSec: Math.floor(600 + Math.random() * 3600),
          calories: Math.floor(100 + Math.random() * 400),
          startedAt: new Date(Date.now() - Math.random() * 7 * 24 * 3600 * 1000),
          finishedAt: new Date(),
        },
      });

      const areaM2 = 8000 + Math.random() * 50000;
      await prisma.territory.create({
        data: {
          userId: user.id,
          activityId: activity.id,
          mode,
          polygon: polygon as object[],
          areaM2,
          centerLat: lat,
          centerLng: lng,
        },
      });
    }
  }

  console.log('✅ Created activities and territories');

  // Create challenges
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 3600 * 1000);

  await prisma.challenge.createMany({
    data: [
      {
        title: 'Tripleta de Quarteirões',
        description: 'Domine 3 quarteirões em 24 horas',
        mode: 'RACE',
        targetValue: 3,
        unit: 'territories',
        rewardEmoji: '🎖️',
        rewardName: 'Médico de Guerra',
        rewardColor: '#22C55E',
        startsAt: now,
        expiresAt: tomorrow,
      },
      {
        title: 'Ciclista Imparável',
        description: 'Pedale 20km em um único dia',
        mode: 'BIKE',
        targetValue: 20,
        unit: 'km',
        rewardEmoji: '⚡',
        rewardName: 'Velocista',
        rewardColor: '#06B6D4',
        startsAt: now,
        expiresAt: tomorrow,
      },
      {
        title: 'Domínio Urbano',
        description: 'Conquiste 5.000 m² de área total',
        targetValue: 5000,
        unit: 'm2',
        rewardEmoji: '🏰',
        rewardName: 'Senhor da Cidade',
        rewardColor: '#A855F7',
        startsAt: now,
        expiresAt: nextWeek,
      },
      {
        title: 'Semana do Guerreiro',
        description: 'Complete uma atividade por 7 dias seguidos',
        targetValue: 7,
        unit: 'days',
        rewardEmoji: '👑',
        rewardName: 'General Supremo',
        rewardColor: '#F59E0B',
        startsAt: now,
        expiresAt: nextWeek,
      },
      {
        title: 'Skatista Lendário',
        description: 'Feche um polígono maior que 10.000m² de skate',
        mode: 'SKATE',
        targetValue: 10000,
        unit: 'm2',
        rewardEmoji: '🛹',
        rewardName: 'Ícone do Asfalto',
        rewardColor: '#A855F7',
        startsAt: now,
        expiresAt: nextWeek,
      },
    ],
  });

  console.log('✅ Created challenges');
  console.log('');
  console.log('🎮 Demo users created:');
  users.forEach(u => console.log(`   ${u.nickname} — ${u.email} — password: password123`));
}

main()
  .catch(err => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
