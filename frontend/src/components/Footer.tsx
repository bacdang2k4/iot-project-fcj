const Footer = () => {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-foreground mb-3">Liên hệ</h3>
            <p className="text-sm text-muted-foreground">Email: namdhse180349@fpt.edu.vn</p>
            <p className="text-sm text-muted-foreground">Hotline: 0911293401</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-3">Thông tin</h3>
            <p className="text-sm text-muted-foreground">Spica AWS First Cloud Journey</p>
            <p className="text-sm text-muted-foreground">Hồ Chí Minh, Việt Nam</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-3">Copyright</h3>
            <p className="text-sm text-muted-foreground">© 2025 Hệ thống giám sát vi phạm giao thông</p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>Hệ thống giám sát và xử phạt vi phạm nồng độ cồn khi tham gia giao thông</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
