import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/authService';

const inputStyle = {
  border: '1px solid #e8e0d8',
  backgroundColor: '#faf7f4',
  borderRadius: 10,
  padding: '9px 14px',
  fontSize: 13,
  color: '#444',
  outline: 'none',
  fontFamily: 'inherit',
  width: '100%',
};

export default function ProfileForm() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    avatarUrl: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || user.username || '',
        phone: user.phone || '',
        email: user.email || '',
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      toast.error('Họ và tên không được để trống');
      return;
    }
    setLoading(true);
    try {
      const response = await api.put('/api/user/profile', {
        fullName: form.fullName,
        phone: form.phone,
        avatarUrl: form.avatarUrl,
      });

      if (response.status === 200) {
        toast.success('Thông tin đã được cập nhật thành công');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật thông tin: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'white', borderRadius: 14, padding: '22px 24px',
      boxShadow: '0 1px 5px rgba(0,0,0,0.06)', border: '1px solid #ede5db'
    }}>
      <h2 style={{ fontSize: 14, fontWeight: 600, color: '#555', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 7 }}>
        <span>👤</span> Cập nhật thông tin
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Row 1 */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 5, fontWeight: 500 }}>
              Họ và tên
            </label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 5, fontWeight: 500 }}>
              Số điện thoại
            </label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Row 2 */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 5, fontWeight: 500 }}>
            Email (Không thể thay đổi)
          </label>
          <input
            type="email"
            value={form.email}
            disabled
            style={{ ...inputStyle, backgroundColor: '#f0ede8', color: '#999' }}
          />
        </div>

        {/* Row 3 */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 5, fontWeight: 500 }}>
            URL Avatar
          </label>
          <input
            type="text"
            name="avatarUrl"
            value={form.avatarUrl}
            onChange={handleChange}
            placeholder="https://example.com/avatar.jpg"
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? '#999' : '#c0392b',
              color: 'white',
              fontSize: 13,
              fontWeight: 600,
              padding: '10px 22px',
              borderRadius: 10,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              boxShadow: '0 2px 6px rgba(192,57,43,0.35)',
              transition: 'background 0.3s',
            }}
          >
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
}
