export class ClassController {
  constructor(classUseCase) {
    this.classUseCase = classUseCase;
  }

  createClass = async (req, res) => {
    const newClass = await this.classUseCase.createClass(req.body);
    res.status(201).json({
      success: true,
      message: 'Kelas berhasil dijadwalkan',
      data: newClass,
    });
  };

  getAllClasses = async (req, res, next) => {
    try {
      const classes = await this.classUseCase.getAllClasses();
      
      return res.status(200).json({
        success: true,
        message: 'Daftar kelas berhasil diambil',
        data: classes
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        pesan_error_bocoran: error.message,
        lokasi_error: error.stack
      });
    }
  };

  async getAllClasses(req, res, next) {
    try {
      // Ambil peran user dari middleware autentikasi (misal: 'Admin' atau 'Member')
      const userRole = req.user ? req.user.peran : 'Member'; 
      
      const classes = await classUseCase.getAllClasses(userRole);
      
      return res.status(200).json({
        status: 'success',
        data: classes
      });
    } catch (error) {
      next(error);
    }
  }


  deleteClass = async (req, res) => {
    const { id } = req.params;
    await this.classUseCase.softDeleteClassById(id); // Pastikan panggil method ini di UseCase
    res.status(200).json({ success: true, message: 'Kelas berhasil dihapus (soft delete)' });
  };
}