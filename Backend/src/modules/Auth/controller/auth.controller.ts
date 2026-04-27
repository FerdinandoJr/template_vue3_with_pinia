import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from '../service/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto, RequestVerificationDto, VerifyEmailDto } from '../dto/register.dto';
import { Public } from '../../../core/decorators/public.decorator';
import { AuthGuard } from '../../../core/guards/auth.guard';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 5, ttl: 60000 }, medium: { limit: 10, ttl: 300000 } })
  @ApiOperation({ summary: 'Realizar login' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @Throttle({ short: { limit: 3, ttl: 60000 }, medium: { limit: 5, ttl: 300000 } })
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 409, description: 'Email já cadastrado' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('request-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar token de verificação de email' })
  @ApiResponse({ status: 200, description: 'Token enviado' })
  async requestVerification(@Body() requestDto: RequestVerificationDto) {
    return this.authService.requestVerification(requestDto);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar email com token' })
  @ApiResponse({ status: 200, description: 'Email verificado' })
  async verifyEmail(@Body() verifyDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyDto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Buscar usuário atual com roles e permissões' })
  @ApiResponse({ status: 200, description: 'Usuário atual' })
  async findMe(@Req() req: any) {
    return this.authService.me(req.userId);
  }
}