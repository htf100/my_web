// 初始命令库。网页编辑后保存在当前浏览器；用导出功能备份。
window.COMMAND_LIBRARY = {
  "categories": [
    {
      "id": "server-root",
      "label": "服务器",
      "parent": null
    },
    {
      "id": "connection",
      "label": "连接与环境",
      "parent": "server-root"
    },
    {
      "id": "wsl",
      "label": "WSL 系统",
      "parent": "connection"
    },
    {
      "id": "mosh",
      "label": "Mosh 远程连接",
      "parent": "connection"
    },
    {
      "id": "tmux",
      "label": "tmux 会话",
      "parent": "server-root"
    },
    {
      "id": "sessions",
      "label": "会话管理",
      "parent": "tmux"
    },
    {
      "id": "windows",
      "label": "窗口与快捷键",
      "parent": "tmux"
    },
    {
      "id": "colab-root",
      "label": "Google Colab",
      "parent": null
    },
    {
      "id": "storage",
      "label": "云盘与文件",
      "parent": "colab-root"
    },
    {
      "id": "drive",
      "label": "挂载与检查",
      "parent": "storage"
    },
    {
      "id": "paths",
      "label": "工作目录",
      "parent": "storage"
    },
    {
      "id": "files",
      "label": "复制与移动",
      "parent": "storage"
    },
    {
      "id": "archive",
      "label": "压缩与归档",
      "parent": "storage"
    },
    {
      "id": "zip",
      "label": "ZIP 压缩包",
      "parent": "archive"
    },
    {
      "id": "tar",
      "label": "tar.gz 归档",
      "parent": "archive"
    },
    {
      "id": "transfer",
      "label": "上传与下载",
      "parent": "storage"
    },
    {
      "id": "run",
      "label": "运行与训练",
      "parent": "colab-root"
    },
    {
      "id": "dependencies",
      "label": "环境与 GPU",
      "parent": "run"
    },
    {
      "id": "training",
      "label": "数据与训练",
      "parent": "run"
    },
    {
      "id": "workflow",
      "label": "完整项目流程",
      "parent": "colab-root"
    },
    {
      "id": "troubleshoot-root",
      "label": "参考与排错",
      "parent": null
    },
    {
      "id": "locations",
      "label": "存储位置说明",
      "parent": "troubleshoot-root"
    },
    {
      "id": "path-errors",
      "label": "路径与文件问题",
      "parent": "troubleshoot-root"
    },
    {
      "id": "io-errors",
      "label": "云盘 I/O 与性能",
      "parent": "troubleshoot-root"
    },
    {
      "id": "runtime-errors",
      "label": "运行环境重置",
      "parent": "troubleshoot-root"
    }
  ],
  "commands": [
    {
      "id": "connect-01",
      "category": "wsl",
      "title": "查看 WSL 系统",
      "description": "列出已安装的 Linux 发行版及运行状态。",
      "code": "wsl --list --verbose",
      "language": "Shell",
      "environment": "server",
      "context": "Windows 终端",
      "note": "",
      "warning": false
    },
    {
      "id": "connect-02",
      "category": "mosh",
      "title": "连接服务器 · 43.156.51.71",
      "description": "使用 Ubuntu 24.04 中的 Mosh 连接。",
      "code": "wsl -d Ubuntu-24.04 -- mosh ubuntu@43.156.51.71",
      "language": "Shell",
      "environment": "server",
      "context": "Windows 终端",
      "note": "需要本机 WSL 与远端均已安装 Mosh。",
      "warning": false
    },
    {
      "id": "connect-03",
      "category": "mosh",
      "title": "连接服务器 · 43.134.25.129",
      "description": "使用默认 WSL 发行版中的 Mosh 连接。",
      "code": "wsl -- mosh ubuntu@43.134.25.129",
      "language": "Shell",
      "environment": "server",
      "context": "Windows 终端",
      "note": "",
      "warning": false
    },
    {
      "id": "connect-04",
      "category": "mosh",
      "title": "指定 Mosh UDP 端口",
      "description": "通过 60000–61000 端口范围建立连接。",
      "code": "wsl -- mosh -p 60000:61000 ubuntu@43.134.25.129",
      "language": "Shell",
      "environment": "server",
      "context": "Windows 终端",
      "note": "服务器防火墙需允许对应的 UDP 端口。",
      "warning": false
    },
    {
      "id": "tmux-05",
      "category": "sessions",
      "title": "新建 htf 会话",
      "description": "创建会话后，在其中启动需要持续运行的任务。",
      "code": "tmux new -s htf",
      "language": "Shell",
      "environment": "server",
      "context": "服务器终端",
      "note": "",
      "warning": false
    },
    {
      "id": "tmux-06",
      "category": "sessions",
      "title": "恢复 htf 会话",
      "description": "下次登录服务器后，回到之前的工作现场。",
      "code": "tmux attach -t htf",
      "language": "Shell",
      "environment": "server",
      "context": "服务器终端",
      "note": "",
      "warning": false
    },
    {
      "id": "tmux-07",
      "category": "sessions",
      "title": "查看已有会话",
      "description": "列出当前用户的所有 tmux 会话。",
      "code": "tmux ls",
      "language": "Shell",
      "environment": "server",
      "context": "服务器终端",
      "note": "",
      "warning": false
    },
    {
      "id": "tmux-08",
      "category": "windows",
      "title": "离开会话，保持运行",
      "description": "先按 Ctrl+b，松开，再按 d。",
      "code": "Ctrl+b → d",
      "language": "快捷键",
      "environment": "server",
      "context": "tmux 内",
      "note": "这是按键顺序，不是终端命令；离开后任务继续运行。",
      "warning": false
    },
    {
      "id": "tmux-09",
      "category": "windows",
      "title": "新建窗口",
      "description": "先按 Ctrl+b，松开，再按 c。",
      "code": "Ctrl+b → c",
      "language": "快捷键",
      "environment": "server",
      "context": "tmux 内",
      "note": "",
      "warning": false
    },
    {
      "id": "tmux-10",
      "category": "windows",
      "title": "切换下一个窗口",
      "description": "先按 Ctrl+b，松开，再按 n。",
      "code": "Ctrl+b → n",
      "language": "快捷键",
      "environment": "server",
      "context": "tmux 内",
      "note": "",
      "warning": false
    },
    {
      "id": "tmux-11",
      "category": "sessions",
      "title": "结束当前会话",
      "description": "先按 Ctrl+b，松开，再按 :；在底部命令栏输入以下内容并回车。",
      "code": "kill-session",
      "language": "tmux 命令",
      "environment": "server",
      "context": "tmux 命令栏",
      "note": "会关闭整个当前会话，并终止其中运行的任务。",
      "warning": true
    },
    {
      "id": "tmux-12",
      "category": "sessions",
      "title": "退出当前终端",
      "description": "退出当前 shell，也可以按 Ctrl+d。",
      "code": "exit",
      "language": "Shell",
      "environment": "server",
      "context": "服务器终端",
      "note": "仅退出当前终端；若这是会话最后一个窗口，会话也会结束。",
      "warning": false
    },
    {
      "id": "drive-13",
      "category": "drive",
      "title": "挂载 Google Drive",
      "description": "每次连接新的运行环境后，先挂载云盘。",
      "code": "from google.colab import drive\ndrive.mount('/content/drive')",
      "language": "Python",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "运行后按 Colab 页面提示授权。",
      "warning": false
    },
    {
      "id": "drive-14",
      "category": "drive",
      "title": "检查云盘与项目目录",
      "description": "确认挂载成功，且 self_learning 项目目录存在。",
      "code": "from pathlib import Path\n\ndrive_root = Path('/content/drive/MyDrive')\nprint('云盘存在：', drive_root.exists())\nprint('项目存在：', (drive_root / 'self_learning').exists())",
      "language": "Python",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "路径大小写必须与实际文件名完全一致。",
      "warning": false
    },
    {
      "id": "drive-15",
      "category": "drive",
      "title": "查看云盘文件",
      "description": "列出“我的云端硬盘”中的文件与目录。",
      "code": "!ls -lah /content/drive/MyDrive",
      "language": "Shell",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "",
      "warning": false
    },
    {
      "id": "drive-16",
      "category": "paths",
      "title": "准备并进入工作目录",
      "description": "查看当前位置，创建项目目录，并持续切换工作目录。",
      "code": "!pwd\n!ls -lah /content\n!mkdir -p /content/self_learning\n%cd /content/self_learning",
      "language": "Colab",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "使用 %cd；!cd 只影响当前那一次 shell 命令。",
      "warning": false
    },
    {
      "id": "files-17",
      "category": "files",
      "title": "复制一个文件",
      "description": "从云盘复制 train.csv 到本地项目目录。",
      "code": "!cp \"/content/drive/MyDrive/self_learning/train.csv\" \"/content/self_learning/\"",
      "language": "Shell",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "目标同名文件可能被覆盖。先确认 /content/self_learning 目录已存在。",
      "warning": false
    },
    {
      "id": "files-18",
      "category": "files",
      "title": "复制并改名",
      "description": "保留源文件，同时创建一份备份。",
      "code": "!cp \"/content/drive/MyDrive/self_learning/train.csv\" \"/content/self_learning/train_backup.csv\"",
      "language": "Shell",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "目标同名文件可能被覆盖。先确认 /content/self_learning 目录已存在。",
      "warning": false
    },
    {
      "id": "files-19",
      "category": "files",
      "title": "复制整个目录",
      "description": "递归复制 weibo_split 目录到本地。",
      "code": "!cp -r \"/content/drive/MyDrive/self_learning/weibo_split\" \"/content/self_learning/\"",
      "language": "Shell",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "目标目录已存在时，可能多嵌套一层源目录，复制后检查结构。",
      "warning": false
    },
    {
      "id": "files-20",
      "category": "files",
      "title": "移动或重命名文件",
      "description": "将备份文件改名为 train_old.csv。",
      "code": "!mv \"/content/self_learning/train_backup.csv\" \"/content/self_learning/train_old.csv\"",
      "language": "Shell",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "移动后原位置不再有该文件。",
      "warning": false
    },
    {
      "id": "files-21",
      "category": "files",
      "title": "检查项目文件",
      "description": "查看工作目录中的文件及大小。",
      "code": "!ls -lh /content/self_learning",
      "language": "Shell",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "",
      "warning": false
    },
    {
      "id": "files-22",
      "category": "files",
      "title": "用 Python 复制文件",
      "description": "自动创建目标目录，并检查源文件是否存在。",
      "code": "from pathlib import Path\nimport shutil\n\nsource = Path('/content/drive/MyDrive/self_learning/train.csv')\ntarget_dir = Path('/content/self_learning')\ntarget_dir.mkdir(parents=True, exist_ok=True)\n\nassert source.is_file(), f'找不到文件：{source}'\nshutil.copy2(source, target_dir / source.name)\nprint('已复制到：', target_dir / source.name)",
      "language": "Python",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "shutil.copy2 会保留文件元数据；目标同名文件可能被覆盖。",
      "warning": false
    },
    {
      "id": "archive-23",
      "category": "zip",
      "title": "ZIP 复制到本地并解压",
      "description": "查看压缩包内容，复制到 /content 后解压。",
      "code": "!unzip -l \"/content/drive/MyDrive/self_learning/dataset.zip\"\n!mkdir -p /content/data\n!cp \"/content/drive/MyDrive/self_learning/dataset.zip\" /content/dataset.zip\n!unzip -q -n /content/dataset.zip -d /content/data",
      "language": "Shell",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "unzip -n 跳过已有同名文件；需要覆盖时再改为 -o。压缩包可能自带一层目录。",
      "warning": false
    },
    {
      "id": "archive-24",
      "category": "tar",
      "title": "解压 tar.gz",
      "description": "先查看归档内容，再解压到 /content/data。",
      "code": "!tar -tzf \"/content/drive/MyDrive/self_learning/dataset.tar.gz\" | head\n!mkdir -p /content/data\n!tar -xzf \"/content/drive/MyDrive/self_learning/dataset.tar.gz\" -C /content/data",
      "language": "Shell",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "重复解压前检查目标目录；同名文件可能被覆盖。",
      "warning": false
    },
    {
      "id": "archive-25",
      "category": "archive",
      "title": "检查解压结果与磁盘占用",
      "description": "确认解压后的目录结构和占用空间。",
      "code": "!ls -lah /content/data\n!du -sh /content/data",
      "language": "Shell",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "",
      "warning": false
    },
    {
      "id": "archive-26",
      "category": "zip",
      "title": "打包结果并保存到云盘",
      "description": "把 dict_weibo_results 打包为 results.zip，再复制回 Drive。",
      "code": "%cd /content/self_learning\n!zip -qr results.zip dict_weibo_results\n!cp results.zip \"/content/drive/MyDrive/self_learning/\"\n!ls -lh \"/content/drive/MyDrive/self_learning/results.zip\"",
      "language": "Colab",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "结果目录需已存在；运行环境重置前及时保存重要结果。",
      "warning": false
    },
    {
      "id": "archive-27",
      "category": "zip",
      "title": "用 Python 解压 ZIP",
      "description": "创建目标目录，预览文件列表后解压。",
      "code": "from pathlib import Path\nfrom zipfile import ZipFile\n\narchive = Path('/content/dataset.zip')\ndestination = Path('/content/data')\ndestination.mkdir(parents=True, exist_ok=True)\nwith ZipFile(archive) as zf:\n    print(zf.namelist()[:10])  # 先看前 10 个文件名\n    zf.extractall(destination)",
      "language": "Python",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "仅解压可信来源的压缩包。",
      "warning": false
    },
    {
      "id": "transfer-28",
      "category": "transfer",
      "title": "从电脑上传文件",
      "description": "通过文件选择框，把少量文件上传到当前工作目录。",
      "code": "from google.colab import files\nuploaded = files.upload()  # 弹出本机文件选择框，文件进入当前工作目录\nprint(list(uploaded))",
      "language": "Python",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "上传到 /content 的文件可能随运行环境重置而消失。",
      "warning": false
    },
    {
      "id": "transfer-29",
      "category": "transfer",
      "title": "下载结果到电脑",
      "description": "将 results.zip 下载到本机。",
      "code": "from google.colab import files\nfiles.download('/content/self_learning/results.zip')",
      "language": "Python",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "补全了 files 导入，可以在单独的代码单元格中运行。",
      "warning": false
    },
    {
      "id": "run-30",
      "category": "dependencies",
      "title": "安装项目依赖",
      "description": "进入项目目录，安装 requirements.txt 中的依赖。",
      "code": "%cd /content/self_learning\n!python -m pip install -r requirements.txt",
      "language": "Colab",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "",
      "warning": false
    },
    {
      "id": "run-31",
      "category": "dependencies",
      "title": "检查 GPU 是否可用",
      "description": "查看 PyTorch 能否使用 CUDA，以及当前 GPU 型号。",
      "code": "import torch\nprint('CUDA 可用：', torch.cuda.is_available())\nif torch.cuda.is_available():\n    print('GPU：', torch.cuda.get_device_name(0))",
      "language": "Python",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "若为 False，在 Colab 的运行时设置中选择 GPU；需要先安装 PyTorch。",
      "warning": false
    },
    {
      "id": "run-32",
      "category": "training",
      "title": "拆分数据",
      "description": "运行项目的 split 子命令，先检查数据拆分结果。",
      "code": "%cd /content/self_learning\n!python dict_weibo.py split",
      "language": "Colab",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "",
      "warning": false
    },
    {
      "id": "run-33",
      "category": "training",
      "title": "运行训练脚本",
      "description": "在项目工作目录中启动 dict_weibo.py。",
      "code": "%cd /content/self_learning\n!python dict_weibo.py",
      "language": "Colab",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "运行前检查脚本中的数据路径，避免仍使用 Windows 的 D:\\... 路径。",
      "warning": false
    },
    {
      "id": "workflow-34",
      "category": "workflow",
      "title": "01 · 挂载云盘",
      "description": "整个流程的第一步：连接存放代码和数据的 Drive。",
      "code": "from google.colab import drive\ndrive.mount('/content/drive')",
      "language": "Python",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "",
      "warning": false
    },
    {
      "id": "workflow-35",
      "category": "workflow",
      "title": "02 · 准备代码与数据",
      "description": "将脚本、依赖文件和 CSV 复制到 Colab 本地目录。",
      "code": "!mkdir -p /content/self_learning\n!cp \"/content/drive/MyDrive/self_learning/dict_weibo.py\" /content/self_learning/\n!cp \"/content/drive/MyDrive/self_learning/requirements.txt\" /content/self_learning/\n!cp \"/content/drive/MyDrive/self_learning/weibo_senti_100k.csv\" /content/self_learning/\n%cd /content/self_learning\n!ls -lh",
      "language": "Colab",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "",
      "warning": false
    },
    {
      "id": "workflow-36",
      "category": "workflow",
      "title": "03 · 修改脚本数据路径",
      "description": "在 dict_weibo.py 顶部修改 SOURCE_PATH。",
      "code": "SOURCE_PATH = ROOT / 'weibo_senti_100k.csv'",
      "language": "Python",
      "environment": "colab",
      "context": "编辑 dict_weibo.py",
      "note": "此行放在脚本内；ROOT 需已定义为脚本所在目录，不能直接作为独立单元格运行。",
      "warning": false
    },
    {
      "id": "workflow-37",
      "category": "workflow",
      "title": "04 · 安装依赖并训练",
      "description": "按顺序安装依赖、检查数据拆分、启动训练。",
      "code": "!python -m pip install -r requirements.txt\n!python dict_weibo.py split   # 先检查拆分结果；正式训练时只运行下一行也会自动拆分\n!python dict_weibo.py",
      "language": "Colab",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "",
      "warning": false
    },
    {
      "id": "workflow-38",
      "category": "workflow",
      "title": "05 · 保存训练结果",
      "description": "训练结束后打包结果并复制回云盘。",
      "code": "%cd /content/self_learning\n!zip -qr results.zip dict_weibo_results\n!cp results.zip \"/content/drive/MyDrive/self_learning/\"",
      "language": "Colab",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "长时间训练时，也应提前把 checkpoint 和日志复制回 Drive。",
      "warning": false
    },
    {
      "id": "troubleshoot-39",
      "category": "locations",
      "title": "认识 /content 与云盘",
      "description": "/content 是临时运行环境本地磁盘；/content/drive/MyDrive 是挂载后的云盘。",
      "code": "/content\n/content/drive/MyDrive\n/content/drive/MyDrive/self_learning",
      "language": "路径参考",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "频繁读取的小文件适合先放本地；需要长期保留的结果存回云盘。",
      "warning": false
    },
    {
      "id": "troubleshoot-40",
      "category": "path-errors",
      "title": "找不到文件 · FileNotFoundError",
      "description": "先检查当前目录、文件是否存在及路径大小写。",
      "code": "!pwd\n!ls -lah /content\n!ls -lah /content/drive/MyDrive",
      "language": "Colab",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "挂载后路径仍不存在时，在左侧文件面板展开 drive，确认真实目录名。",
      "warning": false
    },
    {
      "id": "troubleshoot-41",
      "category": "path-errors",
      "title": "切换目录没有生效",
      "description": "!cd 不会持续改变后续单元格的目录，改用 %cd。",
      "code": "%cd /content/self_learning",
      "language": "Colab",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "",
      "warning": false
    },
    {
      "id": "troubleshoot-42",
      "category": "path-errors",
      "title": "路径中带空格",
      "description": "shell 路径两边加引号，避免被拆成多个参数。",
      "code": "!ls \"/content/drive/MyDrive/My Project\"",
      "language": "Colab",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "",
      "warning": false
    },
    {
      "id": "troubleshoot-43",
      "category": "path-errors",
      "title": "Windows 路径无法使用",
      "description": "遇到 No such file or directory: D:\\...，把脚本路径改为 /content/...。",
      "code": "",
      "language": "Shell",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "Colab 使用 Linux 路径；在项目流程中查看 SOURCE_PATH 的修改示例。",
      "warning": false
    },
    {
      "id": "troubleshoot-44",
      "category": "io-errors",
      "title": "云盘读取慢或出现 I/O 错误",
      "description": "检查目录中的文件数量、Drive 配额，以及是否频繁读取大量小文件。",
      "code": "",
      "language": "Shell",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "大数据集先复制压缩包到 /content，再本地解压和训练。",
      "warning": false
    },
    {
      "id": "troubleshoot-45",
      "category": "runtime-errors",
      "title": "重新连接后结果不见了",
      "description": "检查结果是否只保存在 /content；临时虚拟机重置可能清空本地文件。",
      "code": "",
      "language": "Shell",
      "environment": "colab",
      "context": "Colab 单元格",
      "note": "重要结果保存到 Drive。可在“压缩与归档”中复制打包保存命令。",
      "warning": false
    }
  ],
  "version": 2
};
