import './style.css'
import { useState } from 'react'

function App() {

  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  return (
    <div className="bg-gray-800 h-screen w-screen">
      <div className="flex justify-center align-middle">
        <p className="text-3xl text-red-50 mt-5 font-titillium">WHAT THE FRIDGE?</p>

        <div>
          <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Upload Image</button>

          {isOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                <div className="bg-white rounded-2xl p-6 shadow-lg w-80">
                  <h2 className="text-xl font-semibold mb-4 text-center">Upload Image</h2>

                  {image && (
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                  )}
                  
                  <form action="/upload" method="post">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full mb-4 text-sm"
                    />

                    <div className="flex justify-end gap-3">
                      <button onClick={() => setIsOpen(false)} className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-100">Cancel</button>

                      <button onClick={() => {
                          setIsOpen(false);
                          console.log(image)
                        }}
                        className="px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700" type="submit"
                      >
                      Upload
                      </button>

                    </div>
                  </form>
                </div>
              </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default App
