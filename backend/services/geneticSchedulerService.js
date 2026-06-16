function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function cloneGene(gene) {
    return { ...gene };
}

function buildRandomChromosome(courses, lecturersByCourse, rooms, timeSlots, defaults) {
    return courses.map((course) => {
        const courseLecturers = lecturersByCourse.get(course.id);
        return {
            course_id: course.id,
            lecturer_id: randomItem(courseLecturers).id,
            room_id: randomItem(rooms).id,
            level_id: course.level_id,
            time_slot_id: randomItem(timeSlots).id,
            academic_year: defaults.academic_year,
            semester: defaults.semester
        };
    });
}

function evaluateFitness(chromosome) {
    let penalty = 0;
    const lecturerSlot = new Set();
    const roomSlot = new Set();
    const levelSlot = new Set();

    chromosome.forEach((gene) => {
        const lecturerKey = `${gene.lecturer_id}-${gene.time_slot_id}`;
        const roomKey = `${gene.room_id}-${gene.time_slot_id}`;
        const levelKey = `${gene.level_id}-${gene.time_slot_id}`;

        if (lecturerSlot.has(lecturerKey)) penalty += 5;
        else lecturerSlot.add(lecturerKey);

        if (roomSlot.has(roomKey)) penalty += 5;
        else roomSlot.add(roomKey);

        if (levelSlot.has(levelKey)) penalty += 5;
        else levelSlot.add(levelKey);
    });

    return Math.max(1, 1000 - penalty);
}

function tournamentSelection(population, tournamentSize = 3) {
    let best = null;
    for (let i = 0; i < tournamentSize; i += 1) {
        const candidate = randomItem(population);
        if (!best || candidate.fitness > best.fitness) {
            best = candidate;
        }
    }
    return best;
}

function crossover(parentA, parentB) {
    const split = Math.floor(Math.random() * parentA.length);
    return parentA.map((gene, index) => (index < split ? cloneGene(gene) : cloneGene(parentB[index])));
}

function mutate(chromosome, mutationRate, lecturersByCourse, rooms, timeSlots) {
    return chromosome.map((gene) => {
        if (Math.random() > mutationRate) return gene;

        const mutated = cloneGene(gene);
        const roll = Math.random();
        if (roll < 0.34) {
            mutated.time_slot_id = randomItem(timeSlots).id;
        } else if (roll < 0.67) {
            mutated.room_id = randomItem(rooms).id;
        } else {
            const courseLecturers = lecturersByCourse.get(mutated.course_id);
            mutated.lecturer_id = randomItem(courseLecturers).id;
        }
        return mutated;
    });
}

function runGeneticScheduler({
    courses,
    lecturersByCourse,
    rooms,
    timeSlots,
    defaults,
    populationSize = 24,
    generations = 80,
    mutationRate = 0.08
}) {
    if (!courses.length || !rooms.length || !timeSlots.length) {
        return {
            bestChromosome: [],
            bestFitness: 0,
            generationsRun: 0
        };
    }

    let population = Array.from({ length: populationSize }, () => {
        const chromosome = buildRandomChromosome(courses, lecturersByCourse, rooms, timeSlots, defaults);
        return { chromosome, fitness: evaluateFitness(chromosome) };
    });

    let best = population[0];
    for (let generation = 0; generation < generations; generation += 1) {
        population.sort((a, b) => b.fitness - a.fitness);
        if (population[0].fitness > best.fitness) best = population[0];
        if (best.fitness >= 1000) {
            return {
                bestChromosome: best.chromosome,
                bestFitness: best.fitness,
                generationsRun: generation + 1
            };
        }

        const nextPopulation = [population[0], population[1]];
        while (nextPopulation.length < populationSize) {
            const parentA = tournamentSelection(population).chromosome;
            const parentB = tournamentSelection(population).chromosome;
            const child = mutate(crossover(parentA, parentB), mutationRate, lecturersByCourse, rooms, timeSlots);
            nextPopulation.push({ chromosome: child, fitness: evaluateFitness(child) });
        }
        population = nextPopulation;
    }

    population.sort((a, b) => b.fitness - a.fitness);
    if (population[0].fitness > best.fitness) best = population[0];

    return {
        bestChromosome: best.chromosome,
        bestFitness: best.fitness,
        generationsRun: generations
    };
}

module.exports = { runGeneticScheduler, evaluateFitness };
