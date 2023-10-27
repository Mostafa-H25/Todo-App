// Services
import { MailerService } from '@nestjs-modules/mailer';
import { AuthService } from 'src/auth/auth.service';

// Entity
import { User } from './entities/user.entity';

// Dtos
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginDto } from './dtos/login.dto';
import { LoginResponseDto } from './dtos/login-response.dto';

import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './enums/role.enum';
import { ConfigService } from '@nestjs/config';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private authService: AuthService,
    private configService: ConfigService,
    private mailerService: MailerService,
  ) {}

  // Create new user
  async createUser(createUserDto: CreateUserDto): Promise<void> {
    // check if email already exists
    const emailExists: boolean = (await this.findUserByEmail(
      createUserDto.email,
    ))
      ? true
      : false;
    // check if username already exists
    const usernameExists: boolean = (await this.findUserByUsername(
      createUserDto.username,
    ))
      ? true
      : false;

    // create user if username and email aren't taken or throw an error
    if (emailExists || usernameExists) {
      throw new HttpException(
        'Email or username already taken.',
        HttpStatus.CONFLICT,
      );
    } else {
      // clean data
      const { confirmPassword, ...userDetails } = createUserDto;
      userDetails.password = await this.authService.hashPassword(
        userDetails.password,
      );
      userDetails.username = userDetails.username.toLowerCase().trim();
      userDetails.email = userDetails.email.toLowerCase().trim();
      userDetails.firstName =
        userDetails?.firstName?.toLowerCase().trim() || '';
      userDetails.lastName = userDetails?.lastName?.toLowerCase().trim() || '';

      // save user in db
      await this.userRepository.save(
        this.userRepository.create({
          ...userDetails,
          userRole: Role.User,
          isVerified: false,
          createdAt: new Date(),
        }),
      );

      // EMAIL VERIFICATION
      const user = await this.findUserByEmail(userDetails.email);

      if (user) {
        const payload = {
          sub: user.userId,
          username: user.username,
          userRole: user.userRole,
        };
        // create verification token
        const token = await this.authService.generateRefreshToken(payload);
        const verificationLink =
          'http://localhost:' +
          this.configService.get('port') +
          '/user/verify/' +
          token;

        // send verification email to user
        await this.mailerService.sendMail({
          from: 'mostafa.hafez0@gmail.com',
          to: [user.email],
          subject: 'Verify Account',
          text: `Hello ${user.username}, \nPlease click the following link to verify your account: ${verificationLink}`,
          html: `<p>Hello ${user.username},</p> <p>Please click the following link to verify your account: <a href="${verificationLink}">Verify Account</a></p>`,
        });
      }
    }
  }

  // verify user
  async verifyAccount(verificationToken: string): Promise<void> {
    // verify token
    const payload = await this.authService.verifyToken(verificationToken);
    if (payload) {
      const user = await this.findUserById(payload.sub);
      if (user) {
        // update user status
        await this.userRepository.update(
          { userId: user.userId },
          { isVerified: true },
        );
      }
    }
    throw new UnauthorizedException();
  }
  // change password request
  async changePasswordRequest(email: string): Promise<void> {
    // verify email
    email = email.toLowerCase().trim();
    const user = await this.findUserByEmail(email);
    if (user) {
      const payload = {
        sub: user.userId,
        username: user.username,
        userRole: user.userRole,
      };
      // create verification token
      const token = await this.authService.generateRefreshToken(payload);
      const verificationLink =
        'http://localhost:' +
        this.configService.get('port') +
        '/user/change-password/' +
        token;

      // send verification email to user
      await this.mailerService.sendMail({
        from: 'mostafa.hafez0@gmail.com',
        to: [user.email],
        subject: 'Change Password',
        text: `Hello ${user.username},\n
        We have received to update your password. If you didn't request this update, please contact our help center immediately.\n
        Please click the following link to update your account's password: ${verificationLink}`,
        html: `<p>Hello ${user.username},<p>
        </p>We have received to update your password. If you didn't request this update, please contact our help center immediately.</p> 
        <p>Please click the following link to update your account's password: <a href="${verificationLink}">Update My Password</a></p>`,
      });
    }
    throw new NotFoundException('Email is not found.');
  }

  // change password
  async changePassword(createUserDto: CreateUserDto): Promise<void> {
    createUserDto.email = createUserDto.email.toLowerCase().trim();
    // verify email
    const user = await this.findUserByEmail(createUserDto.email);
    if (!user) {
      throw new NotFoundException('Email is not found.');
    }
    // hash password
    createUserDto.password = await this.authService.hashPassword(
      createUserDto.password,
    );
    // update user password
    await this.userRepository.update(
      { userId: user.userId },
      { password: createUserDto.password },
    );
  }

  // Login user
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    // clean data
    loginDto.username = loginDto.username.toLowerCase().trim();

    // check if user is registered
    const user: User | null = await this.findUserByUsername(loginDto.username);

    if (user) {
      // check if user is verified
      if (!user.isVerified) {
        throw new HttpException(
          'Please check and verify you email.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // check if correct password was submitted
      if (
        await this.authService.checkPassword(loginDto.password, user.password)
      ) {
        const payload = {
          sub: user.userId,
          username: user.username,
          userRole: user.userRole,
        };
        // create access and refresh tokens
        const { accessToken, refreshToken } =
          await this.authService.generateTokens(payload);

        return {
          user: {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            userPhoto: user.userPhoto,
            dateOfBirth: user.dateOfBirth,
            phone: user.phone,
          },
          accessToken,
          refreshToken,
        };
      }
      throw new HttpException(
        'Check your username and password.',
        HttpStatus.UNAUTHORIZED,
      );
    }
    throw new HttpException(
      'Check your username and password.',
      HttpStatus.UNAUTHORIZED,
    );
  }

  // refresh access token
  async refreshAccessToken(refreshToken: string): Promise<string> {
    const payload = this.authService.decodeToken(refreshToken);
    if (payload) {
      const user = await this.findUserById(payload.sub);
      if (user) {
        const payload = {
          sub: user.userId,
          username: user.username,
          userRole: user.userRole,
        };
        const accessToken = this.authService.generateAccessToken(payload);
        return accessToken;
      }
    }
    throw new ForbiddenException();
  }

  // logout user
  async logout(refreshToken: string): Promise<void> {
    this.authService.removeToken(refreshToken);
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////

  // Get all users
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  // Get user by username
  async findUserByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { username } });
  }

  // Get user by email
  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  // Get user by id
  async findUserById(userId: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { userId } });
  }

  // Remove user by id
  async removeUserById(userId: string): Promise<void> {
    await this.userRepository.delete({ userId });
  }
}
