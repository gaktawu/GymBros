export class PaketMembershipController {
  constructor(paketMembershipUseCase) {
    this.paketMembershipUseCase = paketMembershipUseCase;
  }

  createPaket = async (req, res) => {
    const newPaket = await this.paketMembershipUseCase.createPaket(req.body);
    res.status(201).json({ success: true, message: 'Paket membership berhasil dibuat', data: newPaket });
  };

  getAllPaket = async (req, res) => {
    const userRole = req.user ? (req.user.role || req.user.peran) : 'Public';
    const paketList = await this.paketMembershipUseCase.getAllPaket(userRole);
    
    res.status(200).json({ success: true, message: 'Berhasil mengambil daftar paket membership', data: paketList });
  };

  updateStatus = async (req, res) => {
    const { id } = req.params;
    const { statusAktif } = req.body;
    const updatedPaket = await this.paketMembershipUseCase.updateStatus(id, statusAktif);
    res.status(200).json({ success: true, message: 'Status paket membership berhasil diperbarui', data: updatedPaket });
  };

  updatePaket = async (req, res) => {
    const { id } = req.params;
    const updatedPaket = await this.paketMembershipUseCase.updatePaket(id, req.body);
    res.status(200).json({ success: true, message: 'Data paket membership berhasil diperbarui', data: updatedPaket });
  };

  deletePaket = async (req, res) => {
    const { id } = req.params;
    await this.paketMembershipUseCase.softDeletePaketById(id);
    res.status(200).json({ success: true, message: 'Paket membership berhasil dihapus (soft delete)' });
  };
}