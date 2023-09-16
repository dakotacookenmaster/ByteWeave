export type Assignment = {
    assignmentName: string,
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
                defaultXPosition: number,
                defaultYPosition: number
            }[],
            outputs: {
                defaultXPosition: number,
                defaultYPosition: number
            }[],
            truthTable: number[][][]
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