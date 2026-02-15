import os
import re

def check_imports(start_dir):
    errors = []
    import_pattern = re.compile(r'(?:import|from|require)\s+[\'"]([^\'"]+)[\'"]')
    
    for root, dirs, files in os.walk(start_dir):
        for file in files:
            if file.endswith(('.jsx', '.js', '.ts', '.tsx')):
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    for line_num, line in enumerate(f, 1):
                        matches = import_pattern.findall(line)
                        for match in matches:
                            if not match.startswith('.'):
                                continue
                            
                            imported_path = os.path.normpath(os.path.join(root, match))
                            valid = False
                            if os.path.exists(imported_path) and os.path.isfile(imported_path):
                                valid = True
                            else:
                                for ext in ['.jsx', '.js', '.ts', '.tsx', '.json', '.webp', '.png', '.jpg', '.svg']:
                                    if os.path.exists(imported_path + ext):
                                        valid = True
                                        break
                            
                            if not valid:
                                errors.append(f"{file_path}:{line_num}: Failed to resolve '{match}'")
    return errors

if __name__ == "__main__":
    src_dir = "/Users/ebersonpalomino/Desktop/imprenta/Desarrollo/ordenServicio/src"
    import_errors = check_imports(src_dir)
    if import_errors:
        print("\n".join(import_errors))
    else:
        print("No import errors found.")
