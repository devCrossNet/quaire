export const isNil = (value: any) => value === null || value === undefined;

export const hasAnswer = (answer: any) => (Array.isArray(answer) ? answer.length > 0 : isNil(answer) === false);
