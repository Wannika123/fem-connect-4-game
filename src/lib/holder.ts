// 7 columns, 6 rows
// true - 'red disk' , false - 'yellow disk', null - 'empty'
export type Holder = [
    (boolean | null)[], 
    (boolean | null)[], 
    (boolean | null)[], 
    (boolean | null)[], 
    (boolean | null)[], 
    (boolean | null)[], 
    (boolean | null)[]
]

export const emptyHolder: Holder = [
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null]
]
