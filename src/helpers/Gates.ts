export enum GateType {
    AND,
    OR,
    NOT,
    NAND,
    NOR,
    INPUT,
    OUTPUT,
    SEVEN_SEGMENT_DISPLAY,
}

export interface Gate {
    id: number
    type: GateType
    maxInputs: number
    inputs: (Gate | undefined)[]
    output?: boolean
    imgSrc?: string
    value?: string
    dependencies: Gate[]
    defaultPlacement: [number, number]
    decide(): void
    autoGrader(visited: number[]): void
}

const countOccurrences = (array: number[], value: number) => {
    let count = 0
    for (let element of array) {
        if (element === value) {
            count++
        }
    }
    return count
}

export interface Labeled {
    label: string
}

class TwoInputGate {
    dependencies: Gate[] = []
    inputs: (Gate | undefined)[] = [undefined, undefined]
    output = false
    maxInputs = 2
    maxOutputs = 1
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
            if (countOccurrences(visited, dependency.id) > 1) {
                throw new Error("Cycle detected while running autograder.")
            }
            dependency.autoGrader([...visited])
        }
    }
}

class AndGate extends TwoInputGate implements Gate {
    type = GateType.AND
    decide() {
        this.output = this.inputs.every(g => g?.output)
    }
}

class OrGate extends TwoInputGate implements Gate {
    type = GateType.OR
    decide(): void {
        this.output = this.inputs.some(g => g?.output)
    }
}

class NandGate extends TwoInputGate implements Gate {
    output = true
    type = GateType.NAND
    decide(): void {
        this.output = !this.inputs.every(g => g?.output)
    }
}

class NorGate extends TwoInputGate implements Gate {
    type = GateType.NOR
    output = true
    decide(): void {
        this.output = !this.inputs.some(g => g?.output)
    }
}

class NotGate implements Gate {
    output: boolean = true
    type = GateType.NOT
    dependencies: Gate[] = []
    inputs: (Gate | undefined)[] = [undefined]
    maxInputs = 1
    constructor(
        public imgSrc: string,
        public id: number,
        public defaultPlacement: [number, number] = [0, 0]
    ) { }
    decide(): void {
        this.output = !(this.inputs[0]?.output)
    }
    autoGrader(visited: number[]): void {
        visited.push(this.id)
        this.decide()
        for (let dependency of this.dependencies) {
            if (countOccurrences(visited, dependency.id) > 1) {
                throw new Error("Cycle detected while running autograder.")
            }
            dependency.autoGrader([...visited])
        }
    }
}

class InputGate implements Gate, Labeled {
    type = GateType.INPUT
    maxInputs = 0
    inputs = []
    output = false
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
            if (countOccurrences(visited, dependency.id) > 1) {
                throw new Error("Cycle detected while running autograder.")
            }
            dependency.autoGrader([...visited])
        }
    }
}

class OutputGate implements Gate, Labeled {
    dependencies: Gate[] = []
    type = GateType.OUTPUT
    inputs: (Gate | undefined)[] = [undefined]
    output = false
    maxInputs = 1
    constructor(
        public imgSrc: string,
        public id: number,
        public label: string,
        public defaultPlacement: [number, number] = [0, 0]
    ) { }

    decide(): void {
        this.output = Boolean(this.inputs[0]?.output)
    }
    autoGrader(visited: number[]): void {
        visited.push(this.id)
        this.decide()
        for (let dependency of this.dependencies) {
            if (countOccurrences(visited, dependency.id) > 1) {
                throw new Error("Cycle detected while running autograder.")
            }
            dependency.autoGrader([...visited])
        }
    }
}

class SevenSegmentDisplay implements Gate {
    type: GateType = GateType.SEVEN_SEGMENT_DISPLAY
    maxInputs: number = 4
    inputs: (Gate | undefined)[] = [undefined, undefined, undefined, undefined]
    dependencies: Gate[] = []
    constructor(
        public id: number,
        public value: string,
        public defaultPlacement: [number, number] = [0, 0]
    ) { }
    decide(): void {
        const string = this.inputs.reduce((accumulator, input) => {
            return accumulator + (input?.output ? "1" : "0")
        }, "")
        const result = parseInt(string, 2)
        if(result > 9) {
            this.value = "-"
            return
        }
        this.value = `${result}`
    }
    autoGrader(): void {
        this.decide()
    }
}

export {
    AndGate,
    OrGate,
    NotGate,
    NandGate,
    NorGate,
    InputGate,
    OutputGate,
    SevenSegmentDisplay
}