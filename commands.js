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
    },
    {
      "id": "htf-env",
      "label": "Python 环境",
      "parent": null
    },
    {
      "id": "htf-venv",
      "label": "Python 虚拟环境",
      "parent": "htf-env"
    },
    {
      "id": "htf-conda",
      "label": "Conda · maskdino310",
      "parent": "htf-env"
    },
    {
      "id": "htf-conda-create",
      "label": "新建 Conda 环境",
      "parent": "htf-env"
    },
    {
      "id": "htf-vision",
      "label": "图像测量 · DIM",
      "parent": null
    },
    {
      "id": "htf-inspect",
      "label": "图片与测量结果",
      "parent": "htf-vision"
    },
    {
      "id": "htf-batch",
      "label": "预检与批量运行",
      "parent": "htf-vision"
    },
    {
      "id": "htf-learning",
      "label": "评论分类学习",
      "parent": null
    },
    {
      "id": "htf-data",
      "label": "清洗与数据检查",
      "parent": "htf-learning"
    },
    {
      "id": "htf-training",
      "label": "训练与日志",
      "parent": "htf-learning"
    },
    {
      "id": "htf-ops",
      "label": "资源与备份",
      "parent": null
    },
    {
      "id": "htf-resource",
      "label": "资源检查",
      "parent": "htf-ops"
    },
    {
      "id": "htf-backup",
      "label": "备份与大文件",
      "parent": "htf-ops"
    },
    {
      "id": "htf-web",
      "label": "网站与 Git",
      "parent": null
    },
    {
      "id": "htf-web-local",
      "label": "本地检查",
      "parent": "htf-web"
    },
    {
      "id": "htf-web-publish",
      "label": "发布与状态",
      "parent": "htf-web"
    },
    {
      "id": "win-remote-root",
      "label": "Windows 远程访问",
      "parent": "server-root"
    },
    {
      "id": "win-remote-steps",
      "label": "重连四步",
      "parent": "win-remote-root"
    },
    {
      "id": "win-remote-use",
      "label": "连接后使用",
      "parent": "win-remote-root"
    },
    {
      "id": "win-remote-errors",
      "label": "重连失败处理",
      "parent": "win-remote-root"
    },
    {
      "id": "win-remote-config",
      "label": "配置与约束",
      "parent": "win-remote-root"
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
      "id": "connect-ssh-zicp",
      "category": "connection",
      "title": "SSH 连接 · 55e844v521.zicp.fun",
      "description": "使用 hutianfang 用户通过 12793 端口连接服务器。",
      "code": "ssh -p 12793 hutianfang@55e844v521.zicp.fun",
      "language": "Shell",
      "environment": "server",
      "context": "Windows PowerShell / Linux 终端",
      "note": "首次连接时请核对服务器指纹；如需登录密码，在终端提示时输入，不要写进命令。",
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
    },
    {
      "id": "htf-env-01",
      "category": "htf-venv",
      "title": "确认当前 Python 与依赖",
      "description": "定位运行脚本时实际使用的解释器。",
      "code": "python -c 'import sys; print(sys.executable); print(sys.version)'\npython -m pip --version\npython -m pip check",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "激活虚拟环境后再检查；pip check 只检查依赖冲突，不安装软件。",
      "warning": false
    },
    {
      "id": "htf-env-02",
      "category": "htf-venv",
      "title": "建立图像测量独立环境",
      "description": "使用现有 DIM-030-031 的依赖版本，并补充孔2入口需要的 Pillow。",
      "code": "cd /home/ubuntu/disk/htf/maoyu &&\npython -m venv .venv-dim &&\nsource .venv-dim/bin/activate &&\npython -m pip install -r DIM-030-031/requirements.txt Pillow",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "后续测量命令先激活 /home/ubuntu/disk/htf/maoyu/.venv-dim/bin/activate；不同算法版本如有专用环境，优先使用其环境。",
      "warning": false
    },
    {
      "id": "htf-env-03",
      "category": "htf-venv",
      "title": "建立评论训练独立环境",
      "description": "与图像算法隔离，按学习项目的 requirements.txt 安装。",
      "code": "cd /home/ubuntu/disk/htf/self_learning &&\npython -m venv .venv &&\nsource .venv/bin/activate &&\npython -m pip install -r requirements.txt",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "安装会下载 PyTorch 等较大的包。后续训练命令先 source /home/ubuntu/disk/htf/self_learning/.venv/bin/activate；GPU 是否可用仍需单独检查。",
      "warning": false
    },
    {
      "id": "htf-conda-01",
      "category": "htf-conda",
      "title": "激活 maskdino310 环境",
      "description": "先加载服务器上的 Miniforge 初始化脚本，再激活已有环境。",
      "code": "source \"/mnt/sda1/htf/software/miniforge3/etc/profile.d/conda.sh\"\nconda activate maskdino310",
      "language": "Bash",
      "environment": "server",
      "context": "服务器 Bash 终端",
      "note": "直接粘贴到当前 Bash 会话；新开终端或重新登录后需要再次激活。路径来自当前服务器配置。",
      "warning": false
    },
    {
      "id": "htf-conda-02",
      "category": "htf-conda",
      "title": "查看 Conda 环境列表",
      "description": "确认 maskdino310 存在，并查看当前激活的环境。",
      "code": "source \"/mnt/sda1/htf/software/miniforge3/etc/profile.d/conda.sh\"\nconda env list",
      "language": "Bash",
      "environment": "server",
      "context": "服务器 Bash 终端",
      "note": "环境名前的 * 表示当前激活的环境。",
      "warning": false
    },
    {
      "id": "htf-conda-03",
      "category": "htf-conda",
      "title": "核对 maskdino310 的 Python 与 pip",
      "description": "检查环境名、安装目录，以及实际使用的 Python 和 pip。",
      "code": "source \"/mnt/sda1/htf/software/miniforge3/etc/profile.d/conda.sh\"\nconda activate maskdino310\nprintf '环境：%s\\n目录：%s\\n' \"$CONDA_DEFAULT_ENV\" \"$CONDA_PREFIX\"\ncommand -v python\npython -m pip --version",
      "language": "Bash",
      "environment": "server",
      "context": "服务器 Bash 终端",
      "note": "确认输出路径位于 maskdino310 环境下，再用 python -m pip 安装该环境的依赖。",
      "warning": false
    },
    {
      "id": "htf-conda-04",
      "category": "htf-conda",
      "title": "查看 maskdino310 已安装包",
      "description": "列出已有环境中的包和版本，不修改环境。",
      "code": "source \"/mnt/sda1/htf/software/miniforge3/etc/profile.d/conda.sh\"\nconda list -n maskdino310",
      "language": "Bash",
      "environment": "server",
      "context": "服务器 Bash 终端",
      "note": "如需确认某个包，可在终端中用 conda list -n maskdino310 包名筛选。",
      "warning": false
    },
    {
      "id": "htf-conda-05",
      "category": "htf-conda",
      "title": "退出当前 Conda 环境",
      "description": "从当前 Bash 会话退出已激活的环境。",
      "code": "conda deactivate",
      "language": "Bash",
      "environment": "server",
      "context": "服务器 Bash 终端",
      "note": "在已执行过 conda.sh 的同一个终端中使用。",
      "warning": false
    },
    {
      "id": "htf-conda-create-linux",
      "category": "htf-conda-create",
      "title": "Linux 服务器新建 Conda 环境",
      "description": "使用服务器上的 Miniforge 创建 Python 3.10 环境并激活。",
      "code": "ENV_NAME=your_new_env\nsource \"/mnt/sda1/htf/software/miniforge3/etc/profile.d/conda.sh\" &&\nconda create -n \"$ENV_NAME\" python=3.10 &&\nconda activate \"$ENV_NAME\"",
      "language": "Bash",
      "environment": "server",
      "context": "服务器 Bash 终端",
      "note": "先把第一行 your_new_env 改为新环境名；现有 maskdino310 不会被修改。创建时 Conda 会询问是否继续。",
      "warning": false
    },
    {
      "id": "htf-conda-create-windows",
      "category": "htf-conda-create",
      "title": "Windows 新建 Conda 环境",
      "description": "在 Windows 的 Miniforge Prompt 中创建 Python 3.10 环境并激活。",
      "code": "conda create -n your_new_env python=3.10\nconda activate your_new_env",
      "language": "CMD",
      "environment": "server",
      "context": "Windows Miniforge Prompt",
      "note": "先把两处 your_new_env 改成同一个新环境名。Windows 不执行 Linux 的 source conda.sh；普通 PowerShell 需先完成 Conda 初始化。",
      "warning": false
    },
    {
      "id": "htf-vision-01",
      "category": "htf-batch",
      "title": "查看孔2算法包支持的测项",
      "description": "查询 wenjia 合并包的协议、版本和 feature_ids。",
      "code": "python /home/ubuntu/disk/htf/wenjia/DIM-012-013-014-015-016-023/main.py --capabilities",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "只查询能力，不启动图片测量；入口需要 Pillow。",
      "warning": false
    },
    {
      "id": "htf-vision-02",
      "category": "htf-batch",
      "title": "查看 DIM-030 / 031 算法能力",
      "description": "确认双测项包的协议与版本。",
      "code": "python /home/ubuntu/disk/htf/maoyu/DIM-030-031/main.py --capabilities",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "请先激活图像测量环境。",
      "warning": false
    },
    {
      "id": "htf-vision-03",
      "category": "htf-batch",
      "title": "DIM_54 单图测量",
      "description": "对一张图片生成独立结果目录。",
      "code": "python /home/ubuntu/disk/htf/DIM_54/main.py \\\n  --image '/path/to/input.bmp' \\\n  --output \"/home/ubuntu/disk/htf/DIM_54/results/run_$(date +%Y%m%d_%H%M%S)\"",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "将 /path/to/input.bmp 换成实际图片；目录名是 DIM_54，实际测项请以脚本和 result.json 为准。",
      "warning": false
    },
    {
      "id": "htf-vision-04",
      "category": "htf-batch",
      "title": "DIM-015 孔2分组预检",
      "description": "只核对孔2图片顺序与分组，不启动测量。",
      "code": "python /home/ubuntu/disk/htf/maoyu/run_dim015_hole2_groups.py \\\n  --dataset '/path/to/new_new' \\\n  --dim015-algorithm /home/ubuntu/disk/htf/wenjia/DIM-012-013-014-015-016-023 \\\n  --dry-run",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "替换数据目录；脚本按 Hole2 / CAM07 与帧号识别图片，并检查每工件 20 张。",
      "warning": false
    },
    {
      "id": "htf-vision-05",
      "category": "htf-batch",
      "title": "DIM-015 先测第1组",
      "description": "先用一组检查结果和叠加图，再决定是否批量跑。",
      "code": "python /home/ubuntu/disk/htf/maoyu/run_dim015_hole2_groups.py \\\n  --dataset '/path/to/new_new' \\\n  --dim015-algorithm /home/ubuntu/disk/htf/wenjia/DIM-012-013-014-015-016-023 \\\n  --groups 1 --group-size 20 \\\n  --output /home/ubuntu/disk/htf/maoyu/DIM-015_results",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "先执行预检；移除 --groups 1 可跑全部组，追加 --no-overlays 可节省输出空间。每次运行会建立时间戳子目录。",
      "warning": false
    },
    {
      "id": "htf-vision-06",
      "category": "htf-batch",
      "title": "DIM-027 两孔配对预检",
      "description": "检查 hole1 / hole2 的自然排序配对。",
      "code": "python /home/ubuntu/disk/htf/maoyu/run_dim027_groups.py \\\n  --hole1-dir '/path/to/hole1' \\\n  --hole2-dir '/path/to/hole2' \\\n  --dim027 /home/ubuntu/disk/htf/maoyu/DIM-027/main.py \\\n  --groups 1 --group-size 20 --dry-run",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "替换两个图片目录；正式运行时去掉 --dry-run。此命令明确使用 DIM-027 目录中的版本。",
      "warning": false
    },
    {
      "id": "htf-vision-07",
      "category": "htf-batch",
      "title": "DIM-028 小批量检查 · 前5对",
      "description": "使用 scale-aware 包，避免一开始就运行整批。",
      "code": "python /home/ubuntu/disk/htf/maoyu/DIM-004-009-028-scale-aware/test_single_dim.py \\\n  --feature DIM-028 --limit 5 \\\n  --a1-dir '/path/to/A1' --chamfer-dir '/path/to/daojiao' \\\n  --python \"$(command -v python)\" \\\n  --artifact-policy result_and_overlay",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "替换图片目录并先激活图像环境；--feature 可改成 DIM-004 或 DIM-009。脚本按工件、SN、帧号配对。",
      "warning": false
    },
    {
      "id": "htf-vision-08",
      "category": "htf-batch",
      "title": "整批测量前检查相机与图片配对",
      "description": "核对 new_new 数据，避免直接套用脚本里的 Windows 路径。",
      "code": "python /home/ubuntu/disk/htf/maoyu/run_new_new_batch.py \\\n  --dataset '/path/to/new_new' \\\n  --concentricity-algorithm /home/ubuntu/disk/htf/maoyu/DIM-004-009-028-scale-aware/DIM-004-009-028 \\\n  --dim027-algorithm /home/ubuntu/disk/htf/maoyu/DIM-027 \\\n  --output /home/ubuntu/disk/htf/maoyu/batch_results \\\n  --plan-only",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "只预检；确认算法版本、输出路径和配对后，去掉 --plan-only 才会运行测量。",
      "warning": false
    },
    {
      "id": "htf-inspect-01",
      "category": "htf-inspect",
      "title": "查看图片尺寸与色彩模式",
      "description": "快速排查分辨率、通道或格式差异。",
      "code": "python - <<'PY'\nfrom PIL import Image\nfrom pathlib import Path\np = Path('/path/to/input.bmp')\nwith Image.open(p) as image:\n    print(p.name, image.format, image.size, image.mode)\nPY",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "替换图片路径；需要 Pillow，不修改图片。",
      "warning": false
    },
    {
      "id": "htf-inspect-02",
      "category": "htf-inspect",
      "title": "确认两份图片是否完全相同",
      "description": "比较文件 SHA-256，排查是否选错输入文件。",
      "code": "sha256sum '/path/to/first.bmp' '/path/to/second.bmp'",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "相同哈希表示文件字节一致；不同哈希不代表视觉内容一定不同。",
      "warning": false
    },
    {
      "id": "htf-inspect-03",
      "category": "htf-inspect",
      "title": "展开查看测量 result.json",
      "description": "检查 valid、value、confidence 和诊断信息。",
      "code": "python -m json.tool '/path/to/result.json'",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "替换为某一次测量的结果路径；valid=false 的原始值不要直接参与统计。",
      "warning": false
    },
    {
      "id": "htf-inspect-04",
      "category": "htf-inspect",
      "title": "查找测量结果与叠加图",
      "description": "列出 maoyu 内结果文件，按修改时间从新到旧。",
      "code": "find /home/ubuntu/disk/htf/maoyu -type f \\\n  \\( -name 'result.json' -o -iname '*overlay*.jpg' -o -iname '*overlay*.png' \\) \\\n  -printf '%TY-%Tm-%Td %TH:%TM %p\\n' | sort -r | head -n 40",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "",
      "warning": false
    },
    {
      "id": "htf-data-01",
      "category": "htf-data",
      "title": "清洗 JD 数据 · 保留五分类",
      "description": "使用 clean_jd.py 清洗原始训练集与测试集。",
      "code": "cd /home/ubuntu/disk/htf/self_learning &&\npython clean_jd.py \\\n  --train '/path/to/full_train.csv.xz' \\\n  --test '/path/to/full_test.csv.xz' \\\n  --out jd_clean --task five",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "替换原始数据路径；只用 Python 标准库。已有输出目录时脚本会拒绝覆盖；重新清洗请使用新目录。",
      "warning": false
    },
    {
      "id": "htf-data-02",
      "category": "htf-data",
      "title": "微博数据去重并拆分",
      "description": "只准备数据，不启动 chinese_coman.py 的训练。",
      "code": "cd /home/ubuntu/disk/htf/self_learning &&\npython chinese_coman.py split \\\n  '/path/to/weibo_senti_100k.csv' \\\n  \"weibo_split_$(date +%Y%m%d_%H%M%S)\"",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "替换原始 CSV；生成新目录后，将脚本中的 TRAIN_PATH / VAL_PATH / TEST_PATH 指向该目录。需要学习环境。",
      "warning": false
    },
    {
      "id": "htf-data-03",
      "category": "htf-data",
      "title": "准确统计 CSV 记录数与表头",
      "description": "用 CSV 解析器计数，避免评论中的换行导致 wc -l 误计。",
      "code": "python - <<'PY'\nimport csv\nfrom pathlib import Path\np = Path('/path/to/train_pool.csv')\ncsv.field_size_limit(16 * 1024 * 1024)\nwith p.open(encoding='utf-8-sig', newline='') as file:\n    rows = csv.reader(file)\n    print('表头:', next(rows, []))\n    print('数据记录数:', sum(1 for _ in rows))\nPY",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "适用于有表头的未压缩 CSV；大文件需要完整扫描。",
      "warning": false
    },
    {
      "id": "htf-train-01",
      "category": "htf-training",
      "title": "JD 只准备抽样数据",
      "description": "检查清洗后的数据量、缓存与训练配置，不启动完整训练。",
      "code": "cd /home/ubuntu/disk/htf/self_learning &&\npython dict_double.py split",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "先激活学习环境，并检查 CLEAN_DIR。默认需 30 万训练、5 万验证、独立 5 万测试样本。",
      "warning": false
    },
    {
      "id": "htf-train-02",
      "category": "htf-training",
      "title": "JD 训练 / 续训并保存终端日志",
      "description": "实时查看输出，同时保存完整日志。",
      "code": "cd /home/ubuntu/disk/htf/self_learning &&\nmkdir -p logs &&\nset -o pipefail &&\npython -u dict_double.py 2>&1 | tee \"logs/jd_$(date +%Y%m%d_%H%M%S).log\"",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "先激活学习环境。默认从输出目录 last.ckpt 恢复；新实验请修改 OUTPUT_DIR，避免混用旧配置。建议在 tmux 中运行。",
      "warning": true
    },
    {
      "id": "htf-train-03",
      "category": "htf-training",
      "title": "用 JD 已训练模型预测",
      "description": "从 dict_double.py 配置的模型文件加载权重。",
      "code": "cd /home/ubuntu/disk/htf/self_learning &&\npython dict_double.py '质量很好，下次还来' '等了很久，体验很差'",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "需要先训练出 review_double.ckpt；这是五分类模型，标签 0–4 对应 1–5 星。",
      "warning": false
    },
    {
      "id": "htf-train-04",
      "category": "htf-training",
      "title": "运行基础评论二分类训练",
      "description": "运行 dict.py 的完整训练入口。",
      "code": "cd /home/ubuntu/disk/htf/self_learning &&\npython -u dict.py",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "先激活学习环境，检查 train.csv / valid.csv / test.csv 和脚本配置；会更新 review_simple.ckpt，保留旧模型时先备份。",
      "warning": true
    },
    {
      "id": "htf-train-05",
      "category": "htf-training",
      "title": "检查清洗与 JD 数据流程",
      "description": "运行项目现有检查，不启动完整 JD 训练。",
      "code": "cd /home/ubuntu/disk/htf/self_learning &&\npython -m unittest -v test_clean_jd.py test_dict_double.py",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "需要学习环境；检查会使用临时小数据，个别测试会运行极小训练步骤。",
      "warning": false
    },
    {
      "id": "htf-train-06",
      "category": "htf-training",
      "title": "检查 PyTorch 能否使用 GPU",
      "description": "分清 PyTorch 版本、CUDA 构建与实际可见显卡。",
      "code": "python - <<'PY'\nimport torch\nprint('PyTorch:', torch.__version__)\nprint('CUDA build:', torch.version.cuda)\nprint('CUDA available:', torch.cuda.is_available())\nprint('GPU count:', torch.cuda.device_count())\nif torch.cuda.is_available():\n    print('GPU 0:', torch.cuda.get_device_name(0))\nPY",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "在准备训练的同一个虚拟环境执行；CPU 环境显示 False 是正常的。",
      "warning": false
    },
    {
      "id": "htf-train-07",
      "category": "htf-training",
      "title": "持续查看训练日志",
      "description": "重新连接服务器后继续观察已有日志。",
      "code": "tail -n 80 -F '/home/ubuntu/disk/htf/self_learning/logs/你的日志文件.log'",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "替换日志文件名；Ctrl+C 只退出查看，不会停止训练进程。",
      "warning": false
    },
    {
      "id": "htf-ops-01",
      "category": "htf-resource",
      "title": "检查磁盘与各项目占用",
      "description": "先找出图片、模型和结果目录占用的空间。",
      "code": "df -h /home/ubuntu/disk/htf\ndu -h --max-depth=1 /home/ubuntu/disk/htf | sort -h",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "只统计，不删除文件；大量图片时 du 可能需要一些时间。",
      "warning": false
    },
    {
      "id": "htf-ops-02",
      "category": "htf-resource",
      "title": "查看当前用户进程与内存",
      "description": "发现训练或图像处理任务的资源占用。",
      "code": "free -h\nps -u \"$(id -un)\" -o pid,etime,%cpu,%mem,comm --sort=-%mem | head -n 20",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "只查看进程；不要仅凭进程名结束任务。",
      "warning": false
    },
    {
      "id": "htf-ops-03",
      "category": "htf-backup",
      "title": "给学习脚本做一份独立备份",
      "description": "备份 Python 源码、依赖清单和说明，不打包数据与模型。",
      "code": "cd /home/ubuntu/disk/htf/self_learning &&\nmkdir -p /home/ubuntu/disk/htf/backups &&\ntar -czf \"/home/ubuntu/disk/htf/backups/self_learning_code_$(date +%Y%m%d_%H%M%S).tar.gz\" \\\n  -- *.py requirements.txt README.md",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "本地备份，输出留在 htf/backups；不上传到 GitHub。",
      "warning": false
    },
    {
      "id": "htf-ops-04",
      "category": "htf-backup",
      "title": "查找超过 200 MB 的大文件",
      "description": "定位模型、压缩包和大数据文件。",
      "code": "find /home/ubuntu/disk/htf -type d \\( -name .git -o -name .venv -o -name .venv-dim -o -name node_modules \\) -prune -o \\\n  -type f -size +200M -printf '%s\\t%p\\n' | sort -nr | head -n 30",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "第一列单位为字节；只列出文件，不删除。",
      "warning": false
    },
    {
      "id": "htf-web-01",
      "category": "htf-web-local",
      "title": "本地预览命令网站",
      "description": "在本机地址启动静态预览。",
      "code": "cd /home/ubuntu/disk/htf/web &&\npython -m http.server 8000 --bind 127.0.0.1",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "浏览器打开 http://127.0.0.1:8000；远程服务器需使用编辑器端口转发。Ctrl+C 停止预览。",
      "warning": false
    },
    {
      "id": "htf-web-02",
      "category": "htf-web-local",
      "title": "检查网站代码与命令库",
      "description": "修改后先验证 JavaScript 语法、分类结构与新闻采集测试。",
      "code": "cd /home/ubuntu/disk/htf/web &&\nnode --check app.js && node --check commands.js && node --check news.js &&\nnode --test tests/model.test.cjs &&\npython -m unittest discover -s tests -p 'test_*.py'",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "",
      "warning": false
    },
    {
      "id": "htf-web-03",
      "category": "htf-web-local",
      "title": "检查 Git 改动与最近提交",
      "description": "提交前确认有哪些文件发生变化。",
      "code": "git -C /home/ubuntu/disk/htf/web status --short\ngit -C /home/ubuntu/disk/htf/web diff --stat\ngit -C /home/ubuntu/disk/htf/web log -5 --oneline",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "",
      "warning": false
    },
    {
      "id": "htf-web-04",
      "category": "htf-web-publish",
      "title": "提交并发布网站页面修改",
      "description": "推送 main 后由现有 GitHub Actions 部署。",
      "code": "cd /home/ubuntu/disk/htf/web &&\ngit add index.html styles.css app.js model.js commands.js news.js &&\ngit diff --cached --stat &&\ngit commit -m 'Update command desk' &&\ngit push origin main",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "先执行“检查 Git 改动”；会发布暂存区全部改动。新增文件需单独指定，避免把个人笔记、密钥和数据集一起提交。",
      "warning": true
    },
    {
      "id": "htf-web-05",
      "category": "htf-web-publish",
      "title": "查看 GitHub Pages 发布状态",
      "description": "检查最近几次自动部署是否成功。",
      "code": "cd /home/ubuntu/disk/htf/web &&\nGH_CONFIG_DIR=\"$PWD/.git/gh-auth\" gh run list --repo htf100/my_web --limit 5",
      "language": "Bash",
      "environment": "server",
      "context": "Ubuntu 终端",
      "note": "此服务器已使用仓库专属 GitHub 登录目录；其他电脑可在自己的 gh 登录环境中执行，不需要复制鉴权文件。",
      "warning": false
    },
    {
      "id": "win-remote-overview",
      "category": "win-remote-steps",
      "title": "开始前 · 断开后怎样恢复",
      "description": "用于断开连接、Windows 重启或重新打开 Codex 后恢复远程访问。先在 Windows 建立连接，再让 Linux 上的 Codex 实际验证。",
      "code": "",
      "note": "只关闭隧道窗口且 ssh-agent 仍在运行、密钥仍已加载时，可直接执行第 3 步。Windows 重启后从第 1 步开始检查。服务启动在管理员 PowerShell 中执行；加载密钥和建立隧道回到 tfhu 的普通 PowerShell。",
      "context": "说明",
      "environment": "other",
      "language": "说明",
      "warning": false
    },
    {
      "id": "win-remote-services",
      "category": "win-remote-steps",
      "title": "第 1 步 · 检查两个 SSH 服务",
      "description": "在 tfhu 的普通 PowerShell 检查 sshd 与 ssh-agent。",
      "code": "Get-Service sshd,ssh-agent | Select-Object Name,Status,StartType",
      "note": "两个服务的 Status 都应为 Running。ssh-agent 当前为 Manual，Windows 重启后可能需要手动启动。无需重新安装 OpenSSH、重新生成密钥或修改启动类型。",
      "context": "Windows · 普通 PowerShell",
      "environment": "other",
      "language": "PowerShell",
      "warning": false
    },
    {
      "id": "win-remote-start-agent",
      "category": "win-remote-steps",
      "title": "第 1 步 · 启动 ssh-agent",
      "description": "仅在 ssh-agent 显示 Stopped 时：右键开始菜单，打开“终端（管理员）”或“Windows PowerShell（管理员）”。",
      "code": "Start-Service ssh-agent",
      "note": "启动后回到 tfhu 的普通 PowerShell，继续第 2 步。",
      "context": "Windows · 管理员 PowerShell",
      "environment": "other",
      "language": "PowerShell",
      "warning": false
    },
    {
      "id": "win-remote-start-sshd",
      "category": "win-remote-steps",
      "title": "第 1 步 · 启动 sshd",
      "description": "仅在 sshd 也显示 Stopped 时，在管理员 PowerShell 中执行。",
      "code": "Start-Service sshd",
      "note": "启动后再次检查两个服务，并回到普通 PowerShell。",
      "context": "Windows · 管理员 PowerShell",
      "environment": "other",
      "language": "PowerShell",
      "warning": false
    },
    {
      "id": "win-remote-list-keys",
      "category": "win-remote-steps",
      "title": "第 2 步 · 确认密钥已加载",
      "description": "在 Windows 普通 PowerShell 查看 ssh-agent 中的密钥。",
      "code": "ssh-add -l",
      "note": "输出包含 SHA256:LdIz5Un0XNe49YU+So3Z9lkuyTZQcDoSaxvvcOBzHso 时直接进入第 3 步。若提示 Error connecting to agent，先返回第 1 步启动 ssh-agent。",
      "context": "Windows · 普通 PowerShell",
      "environment": "other",
      "language": "PowerShell",
      "warning": false
    },
    {
      "id": "win-remote-load-key",
      "category": "win-remote-steps",
      "title": "第 2 步 · 加载 lab_reverse_tunnel",
      "description": "只有 ssh-add -l 中没有指定指纹时才执行。",
      "code": "ssh-add \"$env:USERPROFILE\\.ssh\\lab_reverse_tunnel\"",
      "note": "出现 Enter passphrase 时，只在 Windows 中输入这把私钥的口令；输入时可能不显示字符。随后再次执行 ssh-add -l，确认指纹 SHA256:LdIz5Un0XNe49YU+So3Z9lkuyTZQcDoSaxvvcOBzHso。",
      "context": "Windows · 普通 PowerShell",
      "environment": "other",
      "language": "PowerShell",
      "warning": false
    },
    {
      "id": "win-remote-tunnel",
      "category": "win-remote-steps",
      "title": "第 3 步 · 建立隧道并保持窗口打开",
      "description": "最关键的一步：在 tfhu 的普通 PowerShell 复制并执行完整一整行。若提示 lab_to_server 的 Enter passphrase，在 Windows 中输入该私钥口令。",
      "code": "ssh -A -T -i \"$env:USERPROFILE\\.ssh\\lab_to_server\" -R 127.0.0.1:2222:127.0.0.1:22 -o IdentitiesOnly=yes -o ExitOnForwardFailure=yes -o StrictHostKeyChecking=yes -o ServerAliveInterval=30 -o ServerAliveCountMax=3 ubuntu@43.156.51.71 'bash /home/ubuntu/disk/htf/windows-remote/hold-tunnel.sh'",
      "note": "成功应显示 Windows Agent ready: SHA256:LdIz5Un0XNe49YU+So3Z9lkuyTZQcDoSaxvvcOBzHso，以及 Keep this Windows SSH window open; Ctrl+C disconnects.\n命令停在那里持续等待是正常状态，保持窗口打开，无需继续输入。关闭窗口或按 Ctrl+C 会断开；休眠、关机、断网也可能断开。恢复后重新连接。\n保留 -A 和 hold-tunnel.sh；它会自动更新服务器上的 Agent 路径，无需复制 SSH_AUTH_SOCK，不要换成只有 -N 的隧道命令。",
      "context": "Windows · 普通 PowerShell",
      "environment": "other",
      "language": "PowerShell",
      "warning": true
    },
    {
      "id": "win-remote-verify",
      "category": "win-remote-steps",
      "title": "第 4 步 · Linux 实际验证连接",
      "description": "保持 Windows 隧道窗口打开，在 Linux 服务器执行下面两个命令，或把下一张卡片的提示发给 Codex。",
      "code": "/home/ubuntu/disk/htf/windows-remote/win-ssh.sh hostname\n/home/ubuntu/disk/htf/windows-remote/win-ssh.sh whoami",
      "note": "预期分别返回 DESKTOP-8BF2DR5 和 desktop-8bf2dr5\\tfhu。第 3 步的就绪提示与这两个命令的实际结果共同确认本次连接可用。每次重连都要重新验证，之前成功不代表本次已连接。",
      "context": "Linux · 服务器终端",
      "environment": "server",
      "language": "Bash",
      "warning": false
    },
    {
      "id": "win-remote-verify-prompt",
      "category": "win-remote-steps",
      "title": "第 4 步 · 发给 Codex 的验证提示",
      "description": "复制这段话到 Linux 服务器上的 Codex 对话中。",
      "code": "Windows 隧道已重连。请用 /home/ubuntu/disk/htf/windows-remote/win-ssh.sh 执行 hostname 和 whoami，确认可以访问。",
      "note": "确认两个命令成功后，再继续告诉 Codex 要执行的 Windows 任务。",
      "context": "Codex · 对话提示",
      "environment": "other",
      "language": "文本",
      "warning": false
    },
    {
      "id": "win-remote-powershell",
      "category": "win-remote-use",
      "title": "从 Linux 执行 Windows PowerShell",
      "description": "win-ssh.sh 用于执行 Windows 命令；win-ps.py 用于执行 PowerShell 脚本。下面示例查看 tfhu 用户目录。",
      "code": "/home/ubuntu/disk/htf/windows-remote/win-ps.py 'Get-ChildItem -LiteralPath \"C:\\Users\\tfhu\"'",
      "note": "支持 tfhu 权限范围内的命令执行、文件读写和本地工具调用；桌面画面查看、鼠标点击和键盘控制尚未配置。",
      "context": "Linux · 服务器终端",
      "environment": "server",
      "language": "Bash",
      "warning": false
    },
    {
      "id": "win-remote-task-prompts",
      "category": "win-remote-use",
      "title": "连接后 · 告诉 Codex 要做什么",
      "description": "在第 4 步验证成功后，可把具体任务发给 Codex。",
      "code": "查看 C:\\Users\\tfhu 下有哪些文件。\n检查我的 Windows Python 环境。\n修改这个文件：C:\\具体目录\\具体文件。",
      "note": "文件修改示例中的路径需替换为实际文件。若运行环境出现批准联网执行提示，按实际提示处理。",
      "context": "Codex · 对话提示",
      "environment": "other",
      "language": "文本",
      "warning": false
    },
    {
      "id": "win-remote-error-socket",
      "category": "win-remote-errors",
      "title": "Windows Agent socket is unavailable",
      "description": "说明本次连接对应的 Agent socket 不可用。",
      "code": "",
      "note": "重新执行第 3 步，并保持 Windows SSH 窗口打开。命令会自动更新 Agent 路径，然后执行第 4 步验证。",
      "context": "说明",
      "environment": "other",
      "language": "说明",
      "warning": false
    },
    {
      "id": "win-remote-error-key",
      "category": "win-remote-errors",
      "title": "Agent 中缺少 lab_reverse_tunnel",
      "description": "所需密钥尚未加载到 Windows ssh-agent。",
      "code": "",
      "note": "先按第 2 步执行 ssh-add 加载密钥，确认指定指纹，再执行第 3 步。口令只在 Windows 提示中输入。",
      "context": "说明",
      "environment": "other",
      "language": "说明",
      "warning": false
    },
    {
      "id": "win-remote-error-forward",
      "category": "win-remote-errors",
      "title": "remote port forwarding failed",
      "description": "先检查自己的旧隧道窗口是否仍在运行。",
      "code": "",
      "note": "若已有可用连接，不必再开一条；其他情况保留完整错误，交给 Codex 检查。不要终止别人的进程。",
      "context": "说明",
      "environment": "other",
      "language": "说明",
      "warning": true
    },
    {
      "id": "win-remote-error-host-key",
      "category": "win-remote-errors",
      "title": "主机密钥不匹配",
      "description": "保留完整错误并核对 Windows 主机指纹。",
      "code": "",
      "note": "此前核对的 Windows ED25519 指纹：SHA256:0K9/PnMqaQ4K7G3/JmnFUAhxjTOd5MB1LCawow7/Jjk。不要关闭主机验证，也不要删除共享账号的主机记录。",
      "context": "说明",
      "environment": "other",
      "language": "说明",
      "warning": true
    },
    {
      "id": "win-remote-error-network",
      "category": "win-remote-errors",
      "title": "connection refused / timeout",
      "description": "保留完整日志，告知 Codex 检查连接状态。",
      "code": "",
      "note": "需要检查 Linux 当前监听状态及 Windows sshd 状态。隧道窗口关闭、休眠、关机或断网后，应恢复并重新按四步连接。",
      "context": "说明",
      "environment": "other",
      "language": "说明",
      "warning": false
    },
    {
      "id": "win-remote-config",
      "category": "win-remote-config",
      "title": "保留的路径、监听与主机信息",
      "description": "这些是已配置的连接入口与核对信息。",
      "code": "",
      "note": "服务器脚本目录：/home/ubuntu/disk/htf/windows-remote。隧道仅监听 Linux 的 127.0.0.1:2222，转发到 Windows 的 127.0.0.1:22。Windows 私钥保留在 C:\\Users\\tfhu\\.ssh。服务器使用任务目录内的独立 known_hosts 和公钥文件，无需修改全局 SSH 配置、防火墙或路由。此前实际核对过 hostname、whoami、PowerShell 中文输出和文件读取，每次重连仍以第 4 步实际命令结果为准。",
      "context": "说明",
      "environment": "other",
      "language": "说明",
      "warning": false
    },
    {
      "id": "win-remote-key-rules",
      "category": "win-remote-config",
      "title": "密钥口令与共享账号的使用约束",
      "description": "保留原连接说明中的配置约束。",
      "code": "",
      "note": "Windows 私钥不得复制到共享服务器。私钥口令只在 Windows 提示中输入，不写进说明、脚本，也不发送到服务器。Agent 转发期间，同用 ubuntu 账号的人也可能使用已加载密钥请求认证；这是此前已说明并接受的共享账号风险。",
      "context": "说明",
      "environment": "other",
      "language": "说明",
      "warning": true
    }
  ],
  "version": 2
};
