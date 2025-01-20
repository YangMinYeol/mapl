import Logo from "./Logo";

export default function Header() {
  return <header className="py-3">
    <div className="flex flex-wrap px-3">
      <div className="w-full md:w-11/12">
        <Logo height="h-12"/>
      </div>
      <div className="flex items-center w-full md:w-1/12">
        <a href="/login" className="hover:text-blue-800">
          로그인
        </a>
      </div>
    </div>
  </header>;
}
