const fs = require('fs');

let content = fs.readFileSync('c:/Users/ASUS/Desktop/Sunset home/src/pages/customer/ProfilePage.tsx', 'utf8');

// If the modal was deleted, we just add it back right before `</div>\n\n        <h2 className="text-xl font-serif tracking-widest uppercase mb-4 text-stone-900 px-2">Lịch sử Đặt phòng</h2>`
// Let's check if it exists

const modalContent = `
          {/* Edit Form Modal */}
          {isEditing && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-serif font-bold text-stone-900">Cập nhật thông tin</h3>
                  <button onClick={() => setIsEditing(false)} className="p-2 bg-stone-100 rounded-full text-stone-400 hover:text-stone-900 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Họ và tên</label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:bg-white transition-colors"
                      placeholder="Nhập họ tên..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Số điện thoại</label>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:bg-white transition-colors"
                      placeholder="Nhập số điện thoại..."
                    />
                  </div>
                  
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="w-full mt-6 flex justify-center items-center px-5 py-3.5 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors font-bold disabled:opacity-50"
                  >
                    {isSaving ? 'Đang lưu...' : <><Save className="w-4 h-4 mr-2" /> Lưu thay đổi</>}
                  </button>
                </div>
              </div>
            </div>
          )}
`;

// It seems it removed the end of the div `<div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6 md:p-8 relative overflow-hidden">`
// AND the `Lịch sử Đặt phòng` title? Wait, no. Let's look at the diff:
// -          {/* Edit Form Overlay */}
// -          {isEditing && (
// ...
// -          )}
// -        </div>
// -
// -        <h2 className="text-xl font-serif tracking-widest uppercase mb-4 text-stone-900 px-2">Lịch sử Đặt phòng</h2>
// -        
// -        {loading ? (

// It deleted all of that and replaced it with what? Nothing.
// Let's restore the whole block.

content = content.replace(
  `              >
                <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
              </button>
            </div>
          </div>
          
          <div className="flex justify-center py-12">`,
  `              >
                <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
              </button>
            </div>
          </div>
${modalContent}
        </div>

        <h2 className="text-xl font-serif tracking-widest uppercase mb-4 text-stone-900 px-2">Lịch sử Đặt phòng</h2>
        
        {loading ? (
          <div className="flex justify-center py-12">`
);

// Wait, the diff block might not have shown exactly what was replaced, it might have just shown what was deleted.
// Let's just do a regex replace to put it back properly.

fs.writeFileSync('c:/Users/ASUS/Desktop/Sunset home/src/pages/customer/ProfilePage.tsx', content);
console.log('Restored edit modal');
