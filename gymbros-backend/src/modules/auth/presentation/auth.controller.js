export class AuthController {
  constructor(authUseCase) {
    this.authUseCase = authUseCase;
  }

  register = async (req, res) => {
    const newUser = await this.authUseCase.register(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: newUser,
    });
  };

  login = async (req, res) => {
    const result = await this.authUseCase.login(req.body);
    
    res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: result,
    });
  };
}