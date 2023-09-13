export interface Gate {
    output: boolean
    input0: boolean
    input1?: boolean
    imgSrc: string
    decide(): void
}

class TwoInputGate {
    output: boolean = false
    constructor(
        public input0: boolean,
        public input1: boolean,
        public imgSrc: string
    ) {}
}

class AndGate extends TwoInputGate implements Gate {
    decide = () => {
        this.output = this.input0 && this.input1
    }
}

class OrGate extends TwoInputGate implements Gate {
    decide(): void {
        this.output = this.input0 || this.input1
    } 
}

class NandGate extends TwoInputGate implements Gate {
    decide(): void {
        this.output = !(this.input0 && this.input1)
    }
}

class NorGate extends TwoInputGate implements Gate {
    decide(): void {
        this.output = !(this.input0 || this.input1)
    }
}

class NotGate implements Gate {
    output: boolean = false
    constructor(
        public input0: boolean,
        public imgSrc: string,
    ) {}
    decide(): void {
        this.output = !this.input0
    }
}

export {
    AndGate,
    OrGate,
    NotGate,
    NandGate,
    NorGate,
}