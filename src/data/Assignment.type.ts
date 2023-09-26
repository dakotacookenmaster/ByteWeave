export type Assignment = {
    canSkipAnyQuestion: boolean,
    gatesProvidedInEveryQuestion: string[],
    questions: {
        instructions: {
            title: string,
            description: string,
            resources: {
                title: string,
                link: string,
            }[]
        },
        gatesProvided: string[],
        canSkip?: boolean,
        answer: {
            inputs: {
                defaultXY: number[],
            }[],
            outputs: {
                defaultXY: number[]
            }[],
            truthTable: number[][][] | string[][][]
        }
    }[],
}

export type Instruction = {
    title: string,
    description: string,
    resources: {
        title: string,
        link: string,
    }[]
}