export interface Gate {
    id: number
    output?: boolean
    input0?: Gate
    input1?: Gate
    inputs?: Gate[]
    imgSrc: string
    dependencies: Gate[]
    defaultPlacement: [number, number]
    decide(): void
    autoGrader(visited: number[]): void
}

const countOccurrences = (array: number[], value: number) => {
    let count = 0
    for(let element of array) {
        if(element === value) {
            count++
        }
    }
    return count
} 

export enum GateType {
    AND,
    OR,
    NOT,
    NAND,
    NOR,
    INPUT,
    OUTPUT
}

export interface Labeled {
    label: string
}

class TwoInputGate {
    dependencies: Gate[] = []
    input0?: Gate
    input1?: Gate
    constructor(
        public imgSrc: string,
        public id: number,
        public defaultPlacement: [number, number] = [0, 0]
    ) { }
    decide(): void { }
    autoGrader(visited: number[]): void {
        visited.push(this.id)
        this.decide()
        for (let dependency of this.dependencies) {
            if(countOccurrences(visited, dependency.id) > 1) {
                throw new Error("Cycle detected while running autograder.")
            }
            dependency.autoGrader([...visited])
        }
    }
}

class AndGate extends TwoInputGate implements Gate {
    output: boolean = false
    decide() {
        this.output = Boolean(this.input0?.output) && Boolean(this.input1?.output)
    }
}

class OrGate extends TwoInputGate implements Gate {
    output: boolean = false
    decide(): void {
        this.output = Boolean(this.input0?.output) || Boolean(this.input1?.output)
    }
}

class NandGate extends TwoInputGate implements Gate {
    output: boolean = true
    decide(): void {
        this.output = !(Boolean(this.input0?.output) && Boolean(this.input1?.output))
    }
}

class NorGate extends TwoInputGate implements Gate {
    output: boolean = true
    decide(): void {
        this.output = !(Boolean(this.input0?.output) || Boolean(this.input1?.output))
    }
}

class NotGate implements Gate {
    output: boolean = true
    dependencies: Gate[] = []
    input0?: Gate
    constructor(
        public imgSrc: string,
        public id: number,
        public defaultPlacement: [number, number] = [0, 0]
    ) { }
    decide(): void {
        this.output = !Boolean(this.input0?.output)
    }
    autoGrader(visited: number[]): void {
        visited.push(this.id)
        this.decide()
        for (let dependency of this.dependencies) {
            if(countOccurrences(visited, dependency.id) > 1) {
                throw new Error("Cycle detected while running autograder.")
            }
            dependency.autoGrader([...visited])
        }
    }
}

class InputGate implements Gate, Labeled {
    output: boolean = false
    constructor(
        public imgSrc: string,
        public id: number,
        public label: string,
        public defaultPlacement: [number, number] = [0, 0]
    ) { }

    dependencies: Gate[] = []
    decide(): void { }
    autoGrader(visited: number[]): void {
        visited.push(this.id)
        this.decide()
        for (let dependency of this.dependencies) {
            if(countOccurrences(visited, dependency.id) > 1) {
                throw new Error("Cycle detected while running autograder.")
            }
            dependency.autoGrader([...visited])
        }
    }
}

class OutputGate implements Gate, Labeled {
    dependencies: Gate[] = []
    output: boolean = false
    input0?: Gate
    constructor(
        public imgSrc: string,
        public id: number,
        public label: string,
        public defaultPlacement: [number, number] = [0, 0]
    ) { }

    decide(): void {
        this.output = Boolean(this.input0?.output)
    }
    autoGrader(visited: number[]): void {
        visited.push(this.id)
        this.decide()
        for(let dependency of this.dependencies) {
            if(countOccurrences(visited, dependency.id) > 1) {
                throw new Error("Cycle detected while running autograder.")
            }
            dependency.autoGrader([...visited])
        }
    }
}

export {
    AndGate,
    OrGate,
    NotGate,
    NandGate,
    NorGate,
    InputGate,
    OutputGate
}