export class EquipmentController {
  constructor(equipmentUseCase) {
    this.equipmentUseCase = equipmentUseCase;
  }

  addEquipment = async (req, res) => {
    const equipment = await this.equipmentUseCase.addEquipment(req.body);
    res.status(201).json({
      success: true,
      message: 'Alat gym berhasil ditambahkan',
      data: equipment,
    });
  };

  getAllEquipment = async (req, res) => {
    const equipments = await this.equipmentUseCase.getAllEquipment();
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar alat gym',
      data: equipments,
    });
  };

  updateStatus = async (req, res) => {
    const { id } = req.params;
    const { statusKondisi } = req.body;
    
    const updatedEq = await this.equipmentUseCase.updateEquipmentStatus(id, statusKondisi);
    res.status(200).json({
      success: true,
      message: 'Status alat gym berhasil diperbarui',
      data: updatedEq,
    });
  };

  deleteEquipment = async (req, res) => {
    const { id } = req.params; // Mengambil ID dari URL
    
    await this.equipmentUseCase.deleteEquipment(id);
    
    res.status(200).json({
      success: true,
      message: 'Alat gym berhasil dihapus secara permanen',
      data: null, // Data dikosongkan karena sudah dihapus
    });
  };
}