import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with WAEC & UTME Science courses...');

  // 1. Create default users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@lms.com' },
    update: {},
    create: {
      email: 'admin@lms.com',
      password: hashedPassword,
      name: 'Dr. Abdul (LMS Admin)',
      role: 'ADMIN',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@lms.com' },
    update: {},
    create: {
      email: 'student@lms.com',
      password: hashedPassword,
      name: 'Sola Kolawole',
      role: 'STUDENT',
    },
  });

  console.log(`Users seeded: Admin (${admin.email}), Student (${student.email})`);

  // 2. Create Courses
  const physicsCourse = await prisma.course.create({
    data: {
      title: 'WAEC Science Prep: Physics',
      description: 'Comprehensive preparation for the WAEC Physics exam, covering Mechanics, Waves, Electromagnetism, and Modern Physics.',
      price: 0.0, // Free course
      isPublished: true,
      coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=600',
    },
  });

  const chemistryCourse = await prisma.course.create({
    data: {
      title: 'UTME Exam Prep: Chemistry',
      description: 'Master the UTME Chemistry syllabus with key lessons on stoichiometry, gas laws, atomic structure, and organic chemistry.',
      price: 2500.0, // Paid course
      isPublished: true,
      coverImage: 'https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?auto=format&fit=crop&q=80&w=600',
    },
  });

  console.log('Courses created.');

  // 3. Create Modules & Lessons for Physics Course
  const mechModule = await prisma.module.create({
    data: {
      title: 'Module 1: Linear Motion and Force',
      order: 1,
      courseId: physicsCourse.id,
    },
  });

  await prisma.lesson.createMany({
    data: [
      {
        title: 'Introduction to Equations of Motion',
        content: `
# Linear Motion and Speed

In physics, motion in a straight line is called linear motion. The key variables we study are:
* **Distance (s)**: The total path length travelled (Scalar).
* **Displacement (s)**: The shortest distance from the start to end point in a specified direction (Vector).
* **Velocity (v)**: Rate of change of displacement.
* **Acceleration (a)**: Rate of change of velocity.

## Three Equations of Motion:
1. **v = u + at** (No displacement)
2. **s = ut + 1/2 at²** (No final velocity)
3. **v² = u² + 2as** (No time)

*Where u = initial velocity, v = final velocity, a = constant acceleration, t = time, s = displacement.*
        `,
        fileType: 'ARTICLE',
        order: 1,
        moduleId: mechModule.id,
      },
      {
        title: 'Lecture Video: Force & Gravity (Offline Video Reference)',
        content: 'Learn about Newton\'s Laws and how gravity pulls objects downwards at 10m/s² in WAEC calculations.',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', // Demo video
        fileType: 'VIDEO',
        order: 2,
        moduleId: mechModule.id,
      },
      {
        title: 'WAEC Physics Study Material (PDF)',
        content: 'Read the official syllabus review guidelines for Mechanics and force calculations.',
        pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Demo PDF
        fileType: 'PDF',
        order: 3,
        moduleId: mechModule.id,
      },
    ],
  });

  // 4. Create Modules & Lessons for Chemistry Course
  const introChemModule = await prisma.module.create({
    data: {
      title: 'Module 1: Atomic Structure & Bonding',
      order: 1,
      courseId: chemistryCourse.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'Understanding Chemical Bonding',
      content: `
# Chemical Bonding

Chemical bonding is the attraction between atoms, ions or molecules that enables the formation of chemical compounds.

## Types of Bonds:
1. **Electrovalent (Ionic) Bonding**: Transfer of electrons from metallic atoms to non-metallic atoms. High melting points (e.g. NaCl).
2. **Covalent Bonding**: Sharing of electrons between non-metallic atoms. Low melting points (e.g. H2O, CO2).
3. **Metallic Bonding**: Force of attraction between valence electrons and the metal ions. Conducts electricity.
      `,
      fileType: 'ARTICLE',
      order: 1,
      moduleId: introChemModule.id,
    },
  });

  console.log('Modules and Lessons created.');

  // 5. Create Practice Test & CBT Exams for Physics
  const physicsPractice = await prisma.assessment.create({
    data: {
      title: 'Physics Mechanics Practice Test (Offline-capable)',
      description: 'Practice test for Mechanics. Review equations of motion and forces. Get instant scoring and solutions.',
      type: 'PRACTICE',
      durationMinutes: 20,
      passingScore: 50.0,
      isPublished: true,
      courseId: physicsCourse.id,
    },
  });

  const physicsCbt = await prisma.assessment.create({
    data: {
      title: 'WAEC Physics CBT Exam (Online-only)',
      description: 'Official online CBT Exam simulating the final WAEC Physics format. Monitor fullscreen lock and score details.',
      type: 'EXAM',
      durationMinutes: 15,
      passingScore: 60.0,
      isPublished: true,
      courseId: physicsCourse.id,
    },
  });

  // 6. Create Questions for Physics Assessments
  await prisma.question.createMany({
    data: [
      // Practice test questions
      {
        questionText: 'A car starts from rest and accelerates uniformly at 4 m/s² for 5 seconds. What is its final velocity?',
        optionA: '10 m/s',
        optionB: '20 m/s',
        optionC: '25 m/s',
        optionD: '40 m/s',
        correctAnswer: 'B',
        explanation: 'Using the first equation of motion: v = u + at. Since it starts from rest, u = 0. Therefore, v = 0 + (4 * 5) = 20 m/s.',
        courseId: physicsCourse.id,
        assessmentId: physicsPractice.id,
      },
      {
        questionText: 'What is the acceleration due to gravity (g) approximately used in WAEC/UTME calculation problems?',
        optionA: '9.81 m/s²',
        optionB: '10.0 m/s²',
        optionC: '8.0 m/s²',
        optionD: '12.0 m/s²',
        correctAnswer: 'B',
        explanation: 'For WAEC and UTME examinations, the acceleration due to gravity (g) is standardly approximated to 10 m/s² for simplicity unless stated otherwise.',
        courseId: physicsCourse.id,
        assessmentId: physicsPractice.id,
      },
      // CBT exam questions
      {
        questionText: 'A body of mass 5 kg is pulled by a force of 50 N. What is the resulting acceleration?',
        optionA: '2 m/s²',
        optionB: '5 m/s²',
        optionC: '10 m/s²',
        optionD: '25 m/s²',
        correctAnswer: 'C',
        explanation: 'Using Newton\'s second law: F = ma => a = F/m. Here, F = 50 N and m = 5 kg. So a = 50 / 5 = 10 m/s².',
        courseId: physicsCourse.id,
        assessmentId: physicsCbt.id,
      },
      {
        questionText: 'The unit of power is standardly named after which physicist?',
        optionA: 'Newton',
        optionB: 'Joule',
        optionC: 'Watt',
        optionD: 'Pascal',
        correctAnswer: 'C',
        explanation: 'Power is defined as work done per unit time. Its unit is the Watt (W), named after James Watt.',
        courseId: physicsCourse.id,
        assessmentId: physicsCbt.id,
      },
    ],
  });

  console.log('Physics questions seeded.');

  // Enroll student in the free physics course
  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: physicsCourse.id,
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
