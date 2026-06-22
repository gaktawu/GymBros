export class PaketMembershipController {
  constructor(paketMembershipUseCase) {
    this.paketMembershipUseCase = paketMembershipUseCase;
  }

  createPaket = async (req, res) => {
    const newPaket = await this.paketMembershipUseCase.createPaket(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Paket membership berhasil dibuat',
      data: newPaket,
    });
  };

  getAllPaket = async (req, res) => {
    const paketList = await this.paketMembershipUseCase.getAllPaket();
    
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar paket membership',
      data: paketList,
    });
  };

  updateStatus = async (req, res) => {
    const { id } = req.params;
    const { statusAktif } = req.body;
    
    const updatedPaket = await this.paketMembershipUseCase.updateStatus(id, statusAktif);
    
    res.status(200).json({
      success: true,
      message: 'Status paket membership berhasil diperbarui',
      data: updatedPaket,
    });
  };
}