export interface Gate {
    id: number
    output?: boolean
    input0?: Gate
    input1?: Gate
    inputs?: Gate[]
    imgSrc: string
    dependencies: Gate[]
    decide(): void
}

export interface Labeled {
    label: string
}

class TwoInputGate {
    dependencies: Gate[] = []
    constructor(
        public imgSrc: string,
        public id: number,
        public input0?: Gate,
        public input1?: Gate,
    ) {}
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
    constructor(
        public imgSrc: string,
        public id: number,
        public input0?: Gate,
    ) {}
    decide(): void {
        this.output = !Boolean(this.input0?.output)
    }
}

class InputGate implements Gate, Labeled {
    output: boolean = false
    constructor(
        public imgSrc: string,
        public id: number,
        public label: string,
    ) {}

    dependencies: Gate[] = []
    decide(): void {}
}

class OutputGate implements Gate, Labeled {
    dependencies: Gate[] = []
    inputs: Gate[] = []
    output: boolean = false
    constructor(
        public imgSrc: string,
        public id: number,
        public label: string,
    ) {}

    decide(): void {
        this.output = this.inputs.some(input => Boolean(input.output))
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