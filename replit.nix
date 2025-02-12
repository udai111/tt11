{pkgs}: {
  deps = [
    pkgs.xsimd
    pkgs.pkg-config
    pkgs.libxcrypt
    pkgs.zlib
    pkgs.libffi
    pkgs.libpng
    pkgs.libjpeg
    pkgs.openssl
    pkgs.suitesparse
    pkgs.openblas
    pkgs.gsl
    pkgs.glpk
    pkgs.fftw
    pkgs.opencl-headers
    pkgs.ocl-icd
    pkgs.glibcLocales
    pkgs.postgresql
    pkgs.zip
  ];
}
