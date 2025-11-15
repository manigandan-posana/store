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

@Entity
@Table(name = "outward_batch_consumptions")
public class OutwardBatchConsumption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "outward_entry_id", nullable = false)
    private OutwardEntry outwardEntry;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "inward_entry_id", nullable = false)
    private InwardEntry inwardEntry;

    @Column(nullable = false, precision = 19, scale = 3)
    private BigDecimal quantity;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public OutwardEntry getOutwardEntry() {
        return outwardEntry;
    }

    public void setOutwardEntry(OutwardEntry outwardEntry) {
        this.outwardEntry = outwardEntry;
    }

    public InwardEntry getInwardEntry() {
        return inwardEntry;
    }

    public void setInwardEntry(InwardEntry inwardEntry) {
        this.inwardEntry = inwardEntry;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }
}
