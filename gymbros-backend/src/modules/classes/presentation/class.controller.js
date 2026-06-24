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

  getAllClasses = async (req, res) => {
    const classes = await this.classUseCase.getAllClasses();
    res.status(200).json({
      success: true,
      message: 'Daftar kelas berhasil diambil',
      data: classes,
    });
  };
}