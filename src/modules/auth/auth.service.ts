import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity, UserRole } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { OTPEntity } from '../user/entities/otp.entity';
import { CheckOtpDto, SendOtpDto } from './dto/otp.dto';
import { randomInt } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokensPayload } from './types/payload';
import { LoginDto, SignupDto } from './dto/basic.dto';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    @InjectRepository(OTPEntity)
    private OTPRepository: Repository<OTPEntity>, 

    private jwtService: JwtService,

    private configService: ConfigService
  ){}

  async sendOtp(otphDto: SendOtpDto) {
    const { mobile } = otphDto;
    let user = await this.userRepository.findOneBy({mobile});
    if(!user){
      await this.userRepository.create({
        mobile
      });
      user = await this.userRepository.save(user); 
    }
    await this.createOtpForUser(user);
    return {
      message: "Code sent Successfully!"
    };
  }

  async checkOtp(otpDto: CheckOtpDto){
    const {mobile, code} = otpDto;
    const user = await this.userRepository.findOne({
      where: {mobile},
      relations: {
        otp: true
      }
  });
  const now = new Date();
    if(!user || !user?.otp)
      throw new UnauthorizedException("Account Not Found!");
    const otp = user?.otp;
    if(otp?.code !== code)
      throw new UnauthorizedException("OTP code is incorerect!")
    if(otp.expires_in < now) throw new UnauthorizedException("OTP code is expired!");
    if(!user.mobile_verify){
      await this.userRepository.update({id: user.id}, { mobile_verify: true });
    }
    const { accessToken, refreshToken } = this.makeTokensForUser({id: user.id, mobile});
    return {
      accessToken,
      refreshToken,
      message: "You logged in successfully!"
    }
  }

  async signup(signupDto: SignupDto){
    const {first_name, last_name, email, mobile, password} = signupDto;
    await this.checkEmail(email);
    await this.checkMobile(mobile);
    let hashedPassword = this.hashPassword(password);
    const user = this.userRepository.create({
      first_name,
      last_name,
      mobile,
      email,
      password: hashedPassword,
      mobile_verify: false,
      role: UserRole.User
    });
    await this.userRepository.save(user);
    return {
      mesagge: "User signeup successfully!"
    }
  }

  async login(loginDto: LoginDto){
    const {email, password} = loginDto;
    const user = await this.userRepository.findOneBy({email});
    if(!user) throw new UnauthorizedException("Incorrect username or password!")
    if(!compareSync(password, user.password)){
      throw new UnauthorizedException("Incorrect username or password!")
    }
    const { accessToken, refreshToken } = this.makeTokensForUser({mobile: user.mobile, id: user.id});

    return {
      accessToken,
      refreshToken,
      mesagge: "Logged in successfully!"
    }
  }

  async checkEmail(email: string){
    const user = await this.userRepository.findOneBy({email});
    if(user) throw new ConflictException("This email already exists!");
  }

  async checkMobile(mobile: string){
    const user = await this.userRepository.findOneBy({mobile});
    if(user) throw new ConflictException("This mobile number already exists!");
  }

  async createOtpForUser(user: UserEntity){
    const expiresIn = new Date(new Date().getTime() + (1000 * 60 * 2));
    const code = randomInt(10000,99999).toString();
    let otp = await this.OTPRepository.findOneBy({userId: user.id});
      if(otp){
        if(otp.expires_in > new Date()){
          throw new BadRequestException("OTP code is not expired yet!");
        }
        otp.code = code;
        otp.expires_in = expiresIn;
      }else {
        otp = this.OTPRepository.create({
          code,
          expires_in: expiresIn,
          userId: user.id
        })
      }
      otp = await this.OTPRepository.save(otp);
      user.otpId = otp.id;
      await this.userRepository.save(user);
    }

  makeTokensForUser(payload: TokensPayload){
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get("Jwt.accessTokenSecret"),
      expiresIn: "30d"
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get("Jwt.refreshTokenSecret"),
      expiresIn: "1y"
    });
    return {
      accessToken,
      refreshToken
    }
  }
  async validateAccessToken(token: string){
    try {
      const payload = this.jwtService.verify<TokensPayload>(token, {
        secret: this.configService.get("Jwt.accessTokenSecret"),
      });
      if(typeof payload == "object" && payload.id){
        const user = await this.userRepository.findOneBy({id: payload.id});
        if(!user) {
          throw new UnauthorizedException("Login to your account first!");
        }
        return user;
      }
      throw new UnauthorizedException("Login to your account first!");
    } catch (error) {
      throw new UnauthorizedException("Login to your account first!");
    }
  }
  hashPassword(password: string){
    const salt = genSaltSync(10);
    return hashSync(password, salt);
  }
}