export class User {
    constructor(private name: string) {}
}

export interface UpdateMsg {

    currentUserName : string,
    selectedUserName: string,
    createdAt: Date,

}
