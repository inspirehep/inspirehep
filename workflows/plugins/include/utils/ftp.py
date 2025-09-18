def list_ftp_files(ftp_hook, parent_dir):
    files = []
    items = ftp_hook.list_directory(parent_dir)
    for item in items:
        try:
            ftp_hook.get_size(item)
            files.append(item)
        except Exception:
            files.extend(list_ftp_files(ftp_hook, item))
    return files
