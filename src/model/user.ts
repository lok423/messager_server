export class User {
    constructor(private name: string) {}
}

export interface UpdateMsg {

    currentUserId : string,
    selectedUserId: string,
    createdAt: Date,
    role: string

}
