# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-23.11"; # or "unstable"

  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_18
    pkgs.python311
    pkgs.python311Packages.pip
    pkgs.python311Packages.virtualenv
  ];

  # Sets environment variables in the workspace
  env = {
    PLAYWRIGHT_BROWSERS_PATH = "0";
  };

  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      "ms-python.python"
      "ms-python.debugpy"
    ];

    # Enable previews
    previews = {
      enable = true;
      previews = {
        frontend = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--host" "0.0.0.0"];
          cwd = "frontend";
          manager = "web";
        };
        backend = {
          command = ["sh" "-c" "source venv/bin/activate && uvicorn main:app --reload --port $PORT --host 0.0.0.0"];
          cwd = "backend";
          manager = "web";
        };
      };
    };

    # Workspace lifecycle hooks
    workspace = {
      # Runs when a workspace is first created
      onCreate = {
        create-venv = "python -m venv backend/venv";
      };
      # Runs when the workspace is (re)started
      onStart = {
        install-frontend = "npm install --prefix frontend";
        install-backend = "source backend/venv/bin/activate && pip install -r backend/requirements.txt";
        install-playwright = "source backend/venv/bin/activate && playwright install chromium";
      };
    };
  };
}
