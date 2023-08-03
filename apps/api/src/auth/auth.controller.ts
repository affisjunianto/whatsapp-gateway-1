/// <reference path="../env.d.ts" />
import '@fastify/cookie'
import {
  Controller,
  HttpCode,
  HttpStatus,
  Request,
  Response,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { SignInDto } from './auth.dto'
import { Auth } from './auth.decorator'
import { UsersService } from '../users/users.service'
import { User } from 'database'
import { TypedBody, TypedRoute } from '@nestia/core'

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @TypedRoute.Post('login')
  /**
   * Sign in with the provided signInDto.
   *
   * @param {SignInDto} signInDto - The signInDto object containing the username and password.
   * @return {any} The result of the authentication process.
   */
  async signIn(
    @TypedBody() signInDto: SignInDto,
    @Response() res: FastifyReply,
  ) {
    const token = await this.authService.signIn(
      signInDto.username,
      signInDto.password,
    )

    res.setCookie('access_token', token.access_token)
    res.setCookie('uuid', token.user.id)

    res.send({
      uuid: token.user.id,
      username: token.user.username,
    })
  }

  @Auth()
  @TypedRoute.Get('profile')
  /**
   * Retrieves the profile of a user.
   *
   * @param {FastifyRequest} req - The request object.
   * @param {FastifyReply} res - The response object.
   * @return {void} The user profile.
   */
  async getProfile(
    @Request() req: FastifyRequest,
    @Response() res: FastifyReply,
  ) {
    const user: Partial<User | null> = await this.userService.findOne(
      req.user?.username ?? '',
    )

    delete user?.['password']

    res.send(user)
  }

  @Auth()
  @TypedRoute.Get('verify')
  /**
   * Verify the request and send a response.
   *
   * @param {Response} res - The response object.
   * @return {void} The response status.
   */
  verify(@Response() res: FastifyReply) {
    res.send({
      status: true,
    })
  }

  @Auth()
  @TypedRoute.Delete('logout')
  /**
   * Logs out the user by clearing the access token cookie and sending a success response.
   *
   * @param {FastifyReply} res - The response object.
   * @param {FastifyRequest} req - The request object.
   * @return {void} No return value.
   */
  logout(@Response() res: FastifyReply, @Request() req: FastifyRequest) {
    res.clearCookie('access_token')
    res.send({
      status: true,
    })
  }
}
