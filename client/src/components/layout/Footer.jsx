import React from 'react';
import { Link } from 'react-router-dom';
import { FiTwitter, FiInstagram, FiFacebook }
    from 'react-icons/fi'
const Footer = () => {
    return (< footer className="bg-white border-t border-gray-100 pt-16 pb-8" >
        < div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" >
            < div className="grid grid-cols-1 md:grid-cols-4 gap-12" >
                < div className="col-span-1 md:col-span-1" >
                    < span className="font-bold text-2xl tracking-tighter text-gray-900 mb-4 block" >
                        JustRent < span className="text-primary" > It</span >       </span >< p className="text-gray-500 text-sm mb-6" > The premium platform for renting almost anything you need, when you need it.
            </p >
 < div className="flex space-x-4 text-gray-400" >
 < a href="#" className="hover:text-primary transition-colors" > <FiTwitter size={20} /></a >
 < a href="#" className="hover:text-primary transition-colors" > <FiInstagram size={20} /></a >
 < a href="#" className="hover:text-primary transition-colors" > <FiFacebook size={20} /></a >
            </div >
          </div >
          
 < div >
 < h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4" > Platform</h3 >
 < ul className="space-y-3" >
 < li > <Link to="/products" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Browse Items</Link></li >
 < li > <Link to="/about" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">How it works</Link></li >
 < li > <Link to="/pricing" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Pricing</Link></li >
            </ul >
          </div >

 < div >
 < h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4" > Support</h3 >
 < ul className="space-y-3" >
 < li > <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Help Center</a></li >
 < li > <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Trust & Safety</a></li >
 < li > <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Contact Us</a></li >
            </ul >
          </div >

 < div >
 < h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4" > Legal</h3 >
 < ul className="space-y-3" >
 < li > <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Privacy Policy</a></li >
 < li > <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Terms of Service</a></li >
            </ul >
          </div >
        </div >
        
 < div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center" >
 < p className="text-sm text-gray-400" >
 & copy; {new Date().getFullYear()} JustRentIt.All rights reserved.
          </p >
        </div >
      </div >
    </footer >
  ); 

}; export default Footer;
