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

  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return this._mapToDomain(result.rows[0]);
  }

  async createUser(userData) {
    const { namaLengkap, email, passwordHash, noTelepon, peran, statusAkun } = userData;
    const query = `
      INSERT INTO users (nama_lengkap, email, password_hash, no_telepon, peran, status_akun)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [
      namaLengkap,
      email,
      passwordHash,
      noTelepon || null,
      peran || 'Member',
      statusAkun || 'Aktif'
    ];
    const result = await db.query(query, values);
    return this._mapToDomain(result.rows[0]);
  }

  // Fungsi untuk update data oleh Admin (Berdasarkan payload frontend)
  async updateUserByAdmin(id, updateData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updateData.namaLengkap !== undefined) {
      fields.push(`nama_lengkap = $${paramIndex++}`);
      values.push(updateData.namaLengkap);
    }
    if (updateData.email !== undefined) {
      fields.push(`email = $${paramIndex++}`);
      values.push(updateData.email);
    }
    if (updateData.peran !== undefined) {
      fields.push(`peran = $${paramIndex++}`);
      values.push(updateData.peran);
    }
    if (updateData.status !== undefined) {
      fields.push(`status_akun = $${paramIndex++}`);
      values.push(updateData.status);
    }

    if (fields.length === 0) return null;

    values.push(id); 
    
    const query = `
      UPDATE users 
      SET ${fields.join(', ')} 
      WHERE id_user = $${paramIndex} 
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    return this._mapToDomain(result.rows[0]);
  }

  // Fungsi khusus untuk Ban/Unban (Toggle Status)
  async updateStatus(id, status) {
    const query = `UPDATE users SET status_akun = $1 WHERE id_user = $2 RETURNING *`;
    const result = await db.query(query, [status, id]);
    return this._mapToDomain(result.rows[0]);
  }
}