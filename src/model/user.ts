export class User {
    constructor(private name: string) {}
}

export interface UpdateMsg {

    currentUser_id : string,
    selectedUser_id: string,
    createdAt: Date,

}
