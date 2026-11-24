print("====== SISTEMA DE NOTAS ========")

notas = []
suma_notas = 0

for i in range(5):
    print(f"--- Registro #{i + 1} ---")
    nombre = input("Ingresar nombre del estudiante: ")
    
    while True:
        nota = float(input("Ingresar nota del estudiante (0.0 - 5.0): "))
        if 0.0 <= nota <= 5.0:
            break
        print(" Error: La nota debe estar entre 0.0 y 5.0. Intenta de nuevo.")

    if nota >= 4.8:
        estado = "Superior"
    elif nota >= 4.0:
        estado = "Alto"
    elif nota >= 3.5:
        estado = "Regular"
    elif nota >= 3.0:
        estado = "Bajo"
    else:
        estado = "Perdió el año!"

    print(f"Resultado: {estado}")

    notas.append({"nombre": nombre, "nota": nota, "estado": estado})
    suma_notas += nota

print("\n====== RESUMEN DE ESTUDIANTES ======")
for est in notas:
    print(f"Estudiante: {est['nombre']} | Nota: {est['nota']:.1f} | Desempeño: {est['estado']}")

promedio = suma_notas / len(notas)
print(f"\nPromedio general del grupo: {promedio:.2f}")