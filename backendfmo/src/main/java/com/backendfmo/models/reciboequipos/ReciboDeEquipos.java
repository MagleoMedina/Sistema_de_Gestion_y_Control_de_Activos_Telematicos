package com.backendfmo.models.reciboequipos;



import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "recibo_de_equipos")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReciboDeEquipos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "marca")
    private String marca;

    @Column(name = "respaldo")
    private String respaldo;
    

    // Relación hacia arriba (hacia el Encabezado)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "encabezado_recibo") // Nombre de la columna FK en tu tabla SQL
    @JsonBackReference
    private EncabezadoRecibo encabezadoRelacion;

    // --- NUEVO: Relación hacia la tabla intermedia ---
    @OneToMany(mappedBy = "equipoRelacion", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<CarpetaRedRecibo> carpetasAsignadas = new ArrayList<>();

    // Helper
    public void agregarRelacionCarpeta(CarpetaRedRecibo relacion) {
        carpetasAsignadas.add(relacion);
        relacion.setEquipoRelacion(this);
    }
    // --- NUEVO: Relación con Componentes Internos ---
    @OneToMany(mappedBy = "equipoRelacion", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ComponenteRecibo> componentesInternos = new ArrayList<>();

    // Helper
    public void agregarComponente(ComponenteRecibo relacion) {
        componentesInternos.add(relacion);
        relacion.setEquipoRelacion(this);
    }
    // Lista de Seriales Específicos
    @OneToMany(mappedBy = "equipoRelacion", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<SerialRecibo> serialesAsignados = new ArrayList<>();

    // Helper
    public void agregarSerial(SerialRecibo relacion) {
        serialesAsignados.add(relacion);
        relacion.setEquipoRelacion(this);
    }

    // NUEVA LISTA: Aplicaciones
    @OneToMany(mappedBy = "equipoRelacion", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<AplicacionReciboEquipos> aplicacionesInstaladas = new ArrayList<>();

    // Helper
    public void agregarAplicacion(AplicacionReciboEquipos relacion) {
        aplicacionesInstaladas.add(relacion);
        relacion.setEquipoRelacion(this);
    }

    // NUEVA LISTA: Periféricos Incluidos
    @OneToMany(mappedBy = "equipoRelacion", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ReciboPeriferico> perifericosIncluidos = new ArrayList<>();

    // Método Helper
    public void agregarPeriferico(ReciboPeriferico relacion) {
        perifericosIncluidos.add(relacion);
        relacion.setEquipoRelacion(this);
    }
}
