import { db } from '../../../shared/config/database.js';
import { User } from '../domain/User.js';
import { supabase } from '../../../shared/config/supabase.js';

export class UsersRepository {
  _mapToDomain(row) {
    if (!row) return null;
    return new User({
      idUser: row.id_user,
      namaLengkap: row.nama_lengkap,
      email: row.email,
      passwordHash: row.password_hash,
      noTelepon: row.no_telepon,
      peran: row.peran,
      statusAkun: row.status_akun,
      fotoProfil: row.foto_profil, 
    });
  }

  async findAll() {
    const query = 'SELECT * FROM users ORDER BY dibuat_pada DESC';
    const result = await db.query(query);
    return result.rows.map(row => this._mapToDomain(row).toJSON());
  }

  async findById(id) {
    const query = 'SELECT * FROM users WHERE id_user = $1';
    const result = await db.query(query, [id]);
    return this._mapToDomain(result.rows[0]);
  }

  // --- FUNGSI 1: Khusus upload gambar ke Supabase ---
  async uploadFileToSupabase(idUser, file) {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `avatars/user-${idUser}-${Date.now()}.${fileExtension}`;

    // Unggah ke bucket 'gymbros-bucket'
    const { error } = await supabase.storage
      .from('gymbros-bucket')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) throw new Error(`Supabase Storage Error: ${error.message}`);

    // Dapatkan Public URL (Pastikan nama bucket sama dengan saat upload)
    const { data: publicUrlData } = supabase.storage
      .from('gymbros-bucket')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  }

  
  async updateProfileCombined(id, updateData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    // Cek data mana saja yang dikirim dari Use Case
    if (updateData.namaLengkap !== undefined) {
      fields.push(`nama_lengkap = $${paramIndex++}`);
      values.push(updateData.namaLengkap);
    }
    if (updateData.noTelepon !== undefined) {
      fields.push(`no_telepon = $${paramIndex++}`);
      values.push(updateData.noTelepon);
    }
    if (updateData.fotoProfil !== undefined) {
      fields.push(`foto_profil = $${paramIndex++}`);
      values.push(updateData.fotoProfil);
    }

    if (fields.length === 0) return null;

    values.push(id); 
    
    // Bangun query SQL secara dinamis
    const query = `
      UPDATE users 
      SET ${fields.join(', ')} 
      WHERE id_user = $${paramIndex} 
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    return this._mapToDomain(result.rows[0]);
  }

  async deleteUserById(id) {
    
    const query = `DELETE FROM public.users WHERE id_user = $1;`;
    return await db.query(query, [id]);
  }
}