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
    output?: boolean
    input0?: Gate
    input1?: Gate
    input2?: Gate
    input3?: Gate
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
            if (countOccurrences(visited, dependency.id) > 1) {
                throw new Error("Cycle detected while running autograder.")
            }
            dependency.autoGrader([...visited])
        }
    }
}

class AndGate extends TwoInputGate implements Gate {
    output: boolean = false
    type = GateType.AND
    decide() {
        this.output = Boolean(this.input0?.output) && Boolean(this.input1?.output)
    }
}

class OrGate extends TwoInputGate implements Gate {
    output: boolean = false
    type = GateType.OR
    decide(): void {
        this.output = Boolean(this.input0?.output) || Boolean(this.input1?.output)
    }
}

class NandGate extends TwoInputGate implements Gate {
    output: boolean = true
    type = GateType.NAND
    decide(): void {
        this.output = !(Boolean(this.input0?.output) && Boolean(this.input1?.output))
    }
}

class NorGate extends TwoInputGate implements Gate {
    output: boolean = true
    type = GateType.NOR
    decide(): void {
        this.output = !(Boolean(this.input0?.output) || Boolean(this.input1?.output))
    }
}

class NotGate implements Gate {
    output: boolean = true
    type = GateType.NOT
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
            if (countOccurrences(visited, dependency.id) > 1) {
                throw new Error("Cycle detected while running autograder.")
            }
            dependency.autoGrader([...visited])
        }
    }
}

class InputGate implements Gate, Labeled {
    output: boolean = false
    type = GateType.INPUT
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
    output: boolean = false
    type = GateType.OUTPUT
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
    input0?: Gate | undefined
    input1?: Gate | undefined
    input2?: Gate | undefined
    input3?: Gate | undefined
    dependencies: Gate[] = []
    constructor(
        public id: number,
        public value: string,
        public defaultPlacement: [number, number] = [0, 0]
    ) { }
    decide(): void {
        const result = parseInt(`${this.input0?.output ? "1" : "0"}${this.input1?.output ? "1" : "0"}${this.input2?.output ? "1" : "0"}${this.input3?.output ? "1" : "0"}`, 2)
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