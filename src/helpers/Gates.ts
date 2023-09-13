export interface Gate {
    id: number
    output: boolean
    input0?: Gate
    input1?: Gate
    imgSrc: string
    dependency?: Gate
    decide(): void
}

class TwoInputGate {
    output: boolean = false
    dependency?: Gate
    constructor(
        public imgSrc: string,
        public id: number,
        public input0?: Gate,
        public input1?: Gate,
    ) {}
}

class AndGate extends TwoInputGate implements Gate {
    decide() {
        const oldOutput = this.output
        this.output = Boolean(this.input0?.output) && Boolean(this.input1?.output)
        if(this.dependency && (this.output !== oldOutput)) {
            this.dependency.decide()
        }
    }
}

class OrGate extends TwoInputGate implements Gate {
    decide(): void {
        const oldOutput = this.output
        this.output = Boolean(this.input0?.output) || Boolean(this.input1?.output)
        if(this.dependency && (this.output !== oldOutput)) {
            this.dependency.decide()
        }
    } 
}

class NandGate extends TwoInputGate implements Gate {
    decide(): void {
        const oldOutput = this.output
        this.output = !(Boolean(this.input0?.output) && Boolean(this.input1?.output))
        if(this.dependency && (this.output !== oldOutput)) {
            this.dependency.decide()
        }
    }
}

class NorGate extends TwoInputGate implements Gate {
    decide(): void {
        const oldOutput = this.output
        this.output = !(Boolean(this.input0?.output) || Boolean(this.input1?.output))
        if(this.dependency && (this.output !== oldOutput)) {
            this.dependency.decide()
        }
    }
}

class NotGate implements Gate {
    output: boolean = true
    dependency?: Gate
    constructor(
        public imgSrc: string,
        public id: number,
        public input0?: Gate,
    ) {}
    decide(): void {
        const oldOutput = this.output
        this.output = !Boolean(this.input0?.output)
        if(this.dependency && (this.output !== oldOutput)) {
            this.dependency.decide()
        }
    }
}

class InputGate implements Gate {
    output: boolean = false
    constructor(
        public imgSrc: string,
        public id: number
    ) {}

    dependency?: Gate
    decide(): void {
        if(this.dependency) {
            this.dependency.decide()
        }
    }
}

export {
    AndGate,
    OrGate,
    NotGate,
    NandGate,
    NorGate,
    InputGate
}