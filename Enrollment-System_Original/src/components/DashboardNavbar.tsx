import React from "react";
import { Link } from "react-router-dom";
import { FileSearch, MessageCircle, FileText, CreditCard, ListOrdered } from "lucide-react";

export default function DashboardNavbar() {
  const dashboard1Id = encodeURIComponent("5L^1W(KN~A0dY*J4C)M+zU@oX&bV%9T3qR_?HgpQtwG#O2mB!6h=fxE");
  const dashboard2Id = encodeURIComponent("yK7&*mQzW^B1p@L!g5J#Xv92hC$TdR4N8F(MoZ%qYEwD6xAU)0s!VktG+3bHj?PnM=cf");
  const dashboard3Id = encodeURIComponent("LCyFu=Y?-G?f?PL[?o4f[Nf4Cv*L{kCGWlW9nI3g$:U=ksl}pB;=KzB=`R(l#F:Q7MXe8DZ!GkK!mc");
  const dashboard4id = encodeURIComponent("h?n!Y(?!SqOEi6g~N2C-%}L}-oz7c_-OaTCwjq=I<Y$s]b.7<}l.L-fp;H;Bh+oSX;H.2ulFH|>YbsWocj");
  const dashboard5id = encodeURIComponent(")!|sX'6bhDr7f^ow<w!J,p<Z]+*44>:*b[1*+'CLlXl2qlzBanH#Q,wrv%S3w-H>W(a?C[Fn3+w/=VMM3TMQ>$s?IDc[.+Md!8t|");

  return (
    <nav className="bg-gray-800 text-white">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <ul className="flex space-x-6">
          <li className="flex items-center space-x-2">
            <FileSearch className="w-5 h-5" />
            <Link to={`/dashboard/${dashboard1Id}`} className="hover:text-gray-300">
              For Interest Test
            </Link>
          </li>
          <li className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <Link to={`/dashboard2/${dashboard2Id}`} className="hover:text-gray-300">
              For Interview
            </Link>
          </li>
          <li className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <Link to={`/dashboard3/${dashboard3Id}`} className="hover:text-gray-300">
              For Documents Review
            </Link>
          </li>
          <li className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <Link to={`/dashboard4/${dashboard4id}`} className="hover:text-gray-300">
              For Payment
            </Link>
          </li>
          <li className="flex items-center space-x-2">
            <ListOrdered className="w-5 h-5" />
            <Link to={`/dashboard5/${dashboard5id}`} className="hover:text-gray-300">
              Sectioning
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
