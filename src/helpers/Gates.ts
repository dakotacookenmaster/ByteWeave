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
    inputs: ({
        gate: Gate | undefined,
        label: string,
    })[]
    output?: boolean
    imgSrc?: string
    value?: string
    dependencies: Gate[]
    defaultPlacement: [number, number]
    decide(): boolean
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
    inputs: ({
        gate: Gate | undefined,
        label: string,
    })[] = [{
        gate: undefined,
        label: "",
    }, {
        gate: undefined,
        label: "",
    }]
    output = false
    maxInputs = 2
    maxOutputs = 1
    constructor(
        public imgSrc: string,
        public id: number,
        public defaultPlacement: [number, number] = [-1, -1]
    ) { }
    decide() {
        return false
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

class AndGate extends TwoInputGate implements Gate {
    type = GateType.AND
    decide(): boolean {
        const oldOutput = this.output
        this.output = this.inputs.every(g => g?.gate?.output)
        return oldOutput !== this.output
    }
}

class OrGate extends TwoInputGate implements Gate {
    type = GateType.OR
    decide(): boolean {
        const oldOutput = this.output
        this.output = this.inputs.some(g => g?.gate?.output)
        return oldOutput !== this.output
    }
}

class NandGate extends TwoInputGate implements Gate {
    output = true
    type = GateType.NAND
    decide(): boolean {
        const oldOutput = this.output
        this.output = !this.inputs.every(g => g?.gate?.output)
        return oldOutput !== this.output
    }
}

class NorGate extends TwoInputGate implements Gate {
    type = GateType.NOR
    output = true
    decide(): boolean {
        const oldOutput = this.output
        this.output = !this.inputs.some(g => g?.gate?.output)
        return oldOutput !== this.output
    }
}

class NotGate implements Gate {
    output: boolean = true
    type = GateType.NOT
    dependencies: Gate[] = []
    inputs: ({
        gate: Gate | undefined,
        label: string,
    })[] = [{
        gate: undefined,
        label: "",
    }]
    maxInputs = 1
    constructor(
        public imgSrc: string,
        public id: number,
        public defaultPlacement: [number, number] = [-1, -1]
    ) { }
    decide(): boolean {
        const oldOutput = this.output
        this.output = !(this.inputs[0]?.gate?.output)
        return oldOutput !== this.output
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
        public defaultPlacement: [number, number] = [-1, -1]
    ) { }

    dependencies: Gate[] = []
    decide(): boolean {
        return false
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

class OutputGate implements Gate, Labeled {
    dependencies: Gate[] = []
    type = GateType.OUTPUT
    inputs: ({
        gate: Gate | undefined,
        label: string,
    })[] = [{
        gate: undefined,
        label: "",
    }]
    output = false
    maxInputs = 1
    constructor(
        public imgSrc: string,
        public id: number,
        public label: string,
        public defaultPlacement: [number, number] = [-1, -1]
    ) { }

    decide(): boolean {
        const oldOutput = this.output
        this.output = Boolean(this.inputs[0]?.gate?.output)
        return oldOutput !== this.output
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
    inputs: ({
        gate: Gate | undefined,
        label: string,
    })[] = [
            {
                gate: undefined,
                label: "8's place (2^3)",
            },
            {
                gate: undefined,
                label: "4's place (2^2)",
            },
            {
                gate: undefined,
                label: "2's place (2^1)",
            },
            {
                gate: undefined,
                label: "1's place (2^0)",
            }
        ]
    dependencies: Gate[] = []
    constructor(
        public id: number,
        public value: string,
        public defaultPlacement: [number, number] = [-1, -1]
    ) { }
    decide(): boolean {
        const oldOutput = this.value
        const string = this.inputs.reduce((accumulator, input) => {
            return accumulator + (input?.gate?.output ? "1" : "0")
        }, "")
        const result = parseInt(string, 2).toString(16) // convert the number to hex
        this.value = `${result}`
        return oldOutput !== this.value
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
    TwoInputGate,
    SevenSegmentDisplay
}