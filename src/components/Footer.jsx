
const Footer = () => {
  return (
    <footer className="bg-gray-100 text-black py-4">
      <div className="container mx-auto text-center">
        {/* Nombre de la empresa */}
        <p className="text-sm font-medium">Corporación Business & Development</p>
        
        {/* Derechos reservados */}
        <p className="text-xs text-gray-600">
          &copy; {new Date().getFullYear()} Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;