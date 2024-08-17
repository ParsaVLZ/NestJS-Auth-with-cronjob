import { registerAs } from "@nestjs/config";

export enum ConfigKeys {
    App = "App",
    Db = "Db",
    Jwt = "Jwt"
}

const AppConfig = registerAs(ConfigKeys.App, () => ({
    port: 3000,

}))

const JwtConfig = registerAs(ConfigKeys.Jwt, () => ({
    accessTokenSecret: "f6f451a95cda009e3195c827192d925ee113e9a2",
   refreshTokenSecret: "dc479bb02d0b63803793a2114d8ffcaa188cd787",
}))

const DbConfig = registerAs(ConfigKeys.Db, () => ({
    port: 5432,
    host: "localhost",
    username: "postgres",
    password: "791011",
    database: "auth-otp"
}))

export const configurations = [AppConfig, DbConfig, JwtConfig];