package com.store.demo.domain;

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
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "outward_entries")
public class OutwardEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;

    @Column(nullable = false, precision = 19, scale = 3)
    private BigDecimal quantity;

    @Column(name = "weight_tons", precision = 19, scale = 3)
    private BigDecimal weightTons;

    @Column(name = "units_count")
    private Integer unitsCount;

    @Column(name = "movement_time", nullable = false)
    private OffsetDateTime movementTime;

    @Column(name = "issued_to", length = 128)
    private String issuedTo;

    @Column(length = 128)
    private String reference;

    @Column(length = 512)
    private String remarks;

    @Column(name = "handover_date")
    private LocalDate handoverDate;

    @Column(name = "handover_name", length = 128)
    private String handoverName;

    @Column(name = "handover_designation", length = 128)
    private String handoverDesignation;

    @Column(name = "store_incharge_name", length = 128)
    private String storeInchargeName;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @OneToMany(mappedBy = "outwardEntry", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OutwardBatchConsumption> batchConsumptions = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public Material getMaterial() {
        return material;
    }

    public void setMaterial(Material material) {
        this.material = material;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getWeightTons() {
        return weightTons;
    }

    public void setWeightTons(BigDecimal weightTons) {
        this.weightTons = weightTons;
    }

    public Integer getUnitsCount() {
        return unitsCount;
    }

    public void setUnitsCount(Integer unitsCount) {
        this.unitsCount = unitsCount;
    }

    public OffsetDateTime getMovementTime() {
        return movementTime;
    }

    public void setMovementTime(OffsetDateTime movementTime) {
        this.movementTime = movementTime;
    }

    public String getIssuedTo() {
        return issuedTo;
    }

    public void setIssuedTo(String issuedTo) {
        this.issuedTo = issuedTo;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public LocalDate getHandoverDate() {
        return handoverDate;
    }

    public void setHandoverDate(LocalDate handoverDate) {
        this.handoverDate = handoverDate;
    }

    public String getHandoverName() {
        return handoverName;
    }

    public void setHandoverName(String handoverName) {
        this.handoverName = handoverName;
    }

    public String getHandoverDesignation() {
        return handoverDesignation;
    }

    public void setHandoverDesignation(String handoverDesignation) {
        this.handoverDesignation = handoverDesignation;
    }

    public String getStoreInchargeName() {
        return storeInchargeName;
    }

    public void setStoreInchargeName(String storeInchargeName) {
        this.storeInchargeName = storeInchargeName;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<OutwardBatchConsumption> getBatchConsumptions() {
        return batchConsumptions;
    }

    public void setBatchConsumptions(List<OutwardBatchConsumption> batchConsumptions) {
        this.batchConsumptions = batchConsumptions;
    }
}
