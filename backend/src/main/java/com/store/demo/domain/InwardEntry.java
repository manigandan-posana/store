package com.store.demo.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "inward_entries")
public class InwardEntry {

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

    @Column(name = "remaining_quantity", nullable = false, precision = 19, scale = 3)
    private BigDecimal remainingQuantity;

    @Column(name = "movement_time", nullable = false)
    private OffsetDateTime movementTime;

    @Column(name = "batch_number", length = 64)
    private String batchNumber;

    @Column(name = "declared_quantity", precision = 19, scale = 3)
    private BigDecimal declaredQuantity;

    @Column(name = "invoice_quantity", precision = 19, scale = 3)
    private BigDecimal invoiceQuantity;

    @Column(name = "weight_tons", precision = 19, scale = 3)
    private BigDecimal weightTons;

    @Column(name = "units_count")
    private Integer unitsCount;

    @Column(name = "vehicle_type", length = 64)
    private String vehicleType;

    @Column(name = "vehicle_number", length = 64)
    private String vehicleNumber;

    @Column(length = 128)
    private String supplier;

    @Column(length = 128)
    private String reference;

    @Column(name = "invoice_number", length = 128)
    private String invoiceNumber;

    @Column(name = "invoice_date")
    private LocalDate invoiceDate;

    @Column(name = "receive_date")
    private LocalDate receiveDate;

    @Column(length = 512)
    private String remarks;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

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

    public BigDecimal getRemainingQuantity() {
        return remainingQuantity;
    }

    public void setRemainingQuantity(BigDecimal remainingQuantity) {
        this.remainingQuantity = remainingQuantity;
    }

    public OffsetDateTime getMovementTime() {
        return movementTime;
    }

    public void setMovementTime(OffsetDateTime movementTime) {
        this.movementTime = movementTime;
    }

    public String getBatchNumber() {
        return batchNumber;
    }

    public void setBatchNumber(String batchNumber) {
        this.batchNumber = batchNumber;
    }

    public BigDecimal getDeclaredQuantity() {
        return declaredQuantity;
    }

    public void setDeclaredQuantity(BigDecimal declaredQuantity) {
        this.declaredQuantity = declaredQuantity;
    }

    public BigDecimal getInvoiceQuantity() {
        return invoiceQuantity;
    }

    public void setInvoiceQuantity(BigDecimal invoiceQuantity) {
        this.invoiceQuantity = invoiceQuantity;
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

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public String getSupplier() {
        return supplier;
    }

    public void setSupplier(String supplier) {
        this.supplier = supplier;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public LocalDate getInvoiceDate() {
        return invoiceDate;
    }

    public void setInvoiceDate(LocalDate invoiceDate) {
        this.invoiceDate = invoiceDate;
    }

    public LocalDate getReceiveDate() {
        return receiveDate;
    }

    public void setReceiveDate(LocalDate receiveDate) {
        this.receiveDate = receiveDate;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
