export class UserResponseDto {
    id!: string;
    email!: string;
    firstName?: string | null;
    lastName?: string | null;
    imageUrl?: string | null;
    createdAt!: Date;
    updatedAt!: Date;
}

export class DeleteUserResponseDto {
    success!: boolean;
    message!: string;
}